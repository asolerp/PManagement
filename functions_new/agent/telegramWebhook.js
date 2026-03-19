/**
 * Webhook HTTP para Telegram Bot.
 * POST: recibe el update, resuelve usuario por telegramId, carga contexto, LLM, envía respuesta.
 */

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");
const { telegramBotToken, openaiApiKey } = require("./config");
const { sendMessage } = require("./telegramApi");
const { askWithTools } = require("./llm");
const { getOpenAITools, runTool } = require("./tools");
const { downloadTelegramFile } = require("./telegramMedia");
const { transcribe } = require("./transcribe");
const {
  setTranscription,
  getSession,
  clearSession,
  addPhotoUrlMaybeGroup,
  setPendingHouseSelection,
  setSelectedProperty,
  setPendingReportConfirmation,
  clearPendingReportConfirmation,
  setPendingIncidentPhotoSelection,
  setSelectedIncidentPhotoTarget,
  clearIncidentPhotoTarget,
  markIncidentPhotoReceivedMaybeGroup,
} = require("./agentSession");
const {
  extractWithOpenAI,
} = require("./reportPipeline/extraction/OpenAIExtractionAdapter");
const { runReportPipeline } = require("./reportPipeline/runReportPipeline");
const {
  createReportFromPipeline,
  findPropertiesByCompanyAndName,
  findSimilarPropertiesByCompanyAndName,
} = require("./createInspectionReport");
const { uploadPhotoToStorage } = require("./uploadPhotoToStorage");

const TELEGRAM_HTML_TAG_RE = /<\/?(b|i|code|pre|u|s|a)\b/i;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function markdownToTelegramHtml(rawText) {
  let text = escapeHtml(rawText);
  // Títulos markdown (#, ##, ###)
  text = text.replace(
    /^#{1,6}\s+(.+)$/gm,
    (_, title) => `<b>${title.trim()}</b>`,
  );
  // Negrita markdown
  text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  // Listas con guion
  text = text.replace(/^\s*-\s+/gm, "• ");
  return text;
}

function formatTelegramMessage(message) {
  const text = String(message || "").trim();
  if (!text) return "";
  // Si ya viene en HTML de Telegram, no tocar.
  if (TELEGRAM_HTML_TAG_RE.test(text)) return text;
  return markdownToTelegramHtml(text);
}

/**
 * Resuelve telegramId a usuario (users collection). Requiere telegramId en el documento.
 * @param {number|string} telegramId - message.from.id
 * @returns {Promise<{ uid: string, companyId: string, role: string } | null>}
 */
async function resolveUserByTelegramId(telegramId) {
  const snap = await admin
    .firestore()
    .collection("users")
    .where("telegramId", "==", String(telegramId))
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  return {
    uid: doc.id,
    companyId: data.companyId || null,
    role: data.role || null,
  };
}

const MAX_INCIDENTS_SEARCH = 120;
const MAX_INCIDENTS_SUGGESTIONS = 6;

function similarityScore(name, search) {
  if (!search) return 0;
  const n = (name || "").trim().toLowerCase();
  const s = search.trim().toLowerCase();
  if (!n || !s) return 0;
  if (n === s) return 100;
  if (n.includes(s)) return 80;
  if (s.includes(n)) return 60;
  let common = 0;
  let si = 0;
  for (let i = 0; i < n.length && si < s.length; i++) {
    if (n[i] === s[si]) {
      common++;
      si++;
    }
  }
  if (common > 0) {
    return 30 + Math.min(20, Math.floor((common / s.length) * 20));
  }
  return 0;
}

async function findIncidentsByCompanyAndName(db, companyId, incidentName) {
  const snap = await db
    .collection("incidents")
    .where("companyId", "==", companyId)
    .limit(MAX_INCIDENTS_SEARCH)
    .get();
  const search = (incidentName || "").trim().toLowerCase();
  if (!search) return [];
  const matches = snap.docs.filter((d) => {
    const data = d.data();
    const title = (data.title || "").toLowerCase();
    const description = (
      data.incidence ||
      data.description ||
      ""
    ).toLowerCase();
    return title.includes(search) || description.includes(search);
  });
  return matches.map((d) => ({ id: d.id, ...d.data() }));
}

async function findSimilarIncidentsByCompanyAndName(
  db,
  companyId,
  incidentName,
  limit = MAX_INCIDENTS_SUGGESTIONS,
) {
  const snap = await db
    .collection("incidents")
    .where("companyId", "==", companyId)
    .limit(MAX_INCIDENTS_SEARCH)
    .get();
  const search = (incidentName || "").trim();
  if (!search) return [];
  const scored = snap.docs.map((d) => {
    const data = d.data();
    const title = data.title || data.incidence || data.description || d.id;
    const score = Math.max(
      similarityScore(title, search),
      similarityScore(data.incidence || data.description || "", search),
    );
    return { id: d.id, title, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((x) => x.score > 0).slice(0, limit);
}

function extractIncidentNameForPhotoCommand(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;
  const patterns = [
    // "adjuntar/subir/enviar fotos a incidencia X"
    /(?:adjuntar|subir|sube|enviar|manda|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s*(?:la\s*)?incidencia\s+(.+)$/i,
    // "subir fotos de X" / "enviar imágenes de X"
    /(?:adjuntar|subir|sube|enviar|manda|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s+(.+)$/i,
    // "quiero subir fotos a/de X"
    /(?:quiero|puedo|necesito)\s+(?:adjuntar|subir|enviar|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s+(.+)$/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = m[1]
        .trim()
        .replace(/^la\s+incidencia\s+/i, "")
        .replace(/^incidencia\s+/i, "")
        .trim();
      if (name) return name;
    }
  }
  return null;
}

const telegramWebhook = onRequest(
  {
    region: REGION,
    timeoutSeconds: 60,
    memory: "256MiB",
    secrets: [telegramBotToken, openaiApiKey],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(200).send("OK");
      return;
    }

    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text?.trim();
    const fromId = message?.from?.id;
    const voice = message?.voice;

    if (!chatId || !fromId) {
      res.status(200).send("OK");
      return;
    }

    const botToken = telegramBotToken.value();
    const apiKey = openaiApiKey.value();
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not set");
      res.status(500).send("Bot not configured");
      return;
    }
    if (!apiKey) {
      console.error("OPENAI_API_KEY not set");
      await sendMessage(
        botToken,
        chatId,
        "El agente no está configurado (falta clave de IA).",
      ).catch(() => {});
      res.status(200).send("OK");
      return;
    }

    const send = (msg) =>
      sendMessage(botToken, chatId, formatTelegramMessage(msg)).catch((e) =>
        console.error("Telegram send error:", e),
      );

    try {
      const user = await resolveUserByTelegramId(fromId);
      if (!user) {
        await send(
          `Aún no tienes acceso al bot.\n\n` +
            `Tu ID de Telegram es: <code>${fromId}</code>\n\n` +
            `Copia este número y pásaselo al administrador. Él lo añadirá a tu usuario en el dashboard y podrás usar el bot.`,
        );
        res.status(200).send("OK");
        return;
      }

      if (!user.companyId) {
        await send(
          "Tu usuario no tiene empresa asignada. Contacta con el administrador.",
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Nota de voz: transcribir, validar casa, guardar en sesión, preguntar por imágenes ———
      if (voice?.file_id) {
        await send("Analizando audio para el informe…");
        const { buffer, extension } = await downloadTelegramFile(
          botToken,
          voice.file_id,
          "voice",
        );
        const transcription = await transcribe(
          apiKey,
          buffer,
          `voice.${extension}`,
        );
        await setTranscription(chatId, user.companyId, transcription);

        const db = admin.firestore();
        const extraction = await extractWithOpenAI(apiKey, transcription);
        const { matchCount, matches } = await findPropertiesByCompanyAndName(
          db,
          user.companyId,
          extraction.propertyName || "",
        );

        if (!extraction.propertyName?.trim()) {
          await send(
            "No he detectado el nombre de la casa en el audio. Vuelve a grabar indicando la propiedad (ej: <i>Casa Mallorca</i>). Después podrás añadir fotos y generar el informe.",
          );
          res.status(200).send("OK");
          return;
        }
        if (matchCount === 0) {
          const similar = await findSimilarPropertiesByCompanyAndName(
            db,
            user.companyId,
            extraction.propertyName.trim(),
            6,
          );
          if (similar.length > 0) {
            await setPendingHouseSelection(
              chatId,
              similar,
              extraction.propertyName.trim(),
            );
            const list = similar
              .map((m, i) => `${i + 1}) ${m.houseName}`)
              .join("\n");
            await send(
              `No encontré ninguna casa con el nombre "<i>${extraction.propertyName.trim()}</i>". ¿Quisiste decir alguna de estas?\n\n${list}\n\nResponde con el <b>número</b> (1, 2, …) o el <b>nombre</b> de la casa para continuar con el informe. El audio ya está guardado.`,
            );
          } else {
            await send(
              `No encontré ninguna casa con el nombre "<i>${extraction.propertyName.trim()}</i>" ni parecidas en tu empresa. Comprueba el nombre en el dashboard o graba de nuevo indicando la propiedad.`,
            );
          }
          res.status(200).send("OK");
          return;
        }
        if (matchCount > 1) {
          await setPendingHouseSelection(
            chatId,
            matches,
            extraction.propertyName.trim(),
          );
          const list = matches
            .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
            .join("\n");
          await send(
            `Varias casas coinciden con "<i>${extraction.propertyName.trim()}</i>". Elige una:\n\n${list}\n\nResponde con el <b>número</b> (1, 2, …) o el <b>nombre</b> de la casa. El audio ya está guardado. Después podrás subir fotos y crear el informe.`,
          );
          res.status(200).send("OK");
          return;
        }
        const singleMatch = matches[0];
        await setSelectedProperty(
          chatId,
          singleMatch.id,
          singleMatch.houseName || extraction.propertyName,
        );
        const houseName = singleMatch.houseName || extraction.propertyName;
        await send(
          `Casa detectada: <b>${houseName}</b>. ¿Quieres subir fotos? Envía las imágenes o escribe <b>Crear informe</b> cuando acabes.`,
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Foto(s): subir a Storage y añadir a sesión. Un solo mensaje por envío (álbum = un mensaje por lote). ———
      const photo = message?.photo;
      const mediaGroupId = message?.media_group_id || null;
      if (photo?.length) {
        const session = await getSession(chatId);
        const fileId = photo[photo.length - 1].file_id;
        try {
          const { buffer } = await downloadTelegramFile(
            botToken,
            fileId,
            "photo",
          );
          const url = await uploadPhotoToStorage(
            user.companyId,
            buffer,
            "image/jpeg",
          );

          // Prioridad: si hay una incidencia seleccionada para adjuntar fotos, subir ahí.
          if (session?.selectedIncidentPhotoTargetId) {
            const db = admin.firestore();
            const incidentRef = db
              .collection("incidents")
              .doc(session.selectedIncidentPhotoTargetId);
            const incidentSnap = await incidentRef.get();
            if (!incidentSnap.exists) {
              await clearIncidentPhotoTarget(chatId);
              await send(
                "La incidencia seleccionada ya no existe. Indica de nuevo el nombre de la incidencia para adjuntar fotos.",
              );
              res.status(200).send("OK");
              return;
            }
            const incidentData = incidentSnap.data() || {};
            if (incidentData.companyId !== user.companyId) {
              await clearIncidentPhotoTarget(chatId);
              await send(
                "Esa incidencia no pertenece a tu empresa. Indica otra incidencia para adjuntar fotos.",
              );
              res.status(200).send("OK");
              return;
            }

            await incidentRef.update({
              photos: admin.firestore.FieldValue.arrayUnion(url),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            await incidentRef.collection("activity").add({
              type: "photo_added",
              source: "telegram",
              photoUrl: url,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            const { shouldSendMessage } =
              await markIncidentPhotoReceivedMaybeGroup(chatId, mediaGroupId);
            if (shouldSendMessage) {
              const name =
                session.selectedIncidentPhotoTargetName ||
                incidentData.title ||
                "la incidencia seleccionada";
              await send(
                `Foto${mediaGroupId ? "s" : ""} añadida${mediaGroupId ? "s" : ""} a <b>${name}</b>. Puedes seguir enviando imágenes o escribir <b>Terminar fotos</b> para salir de este modo.`,
              );
            }
          } else {
            if (!session?.lastTranscription) {
              await send(
                "Para añadir fotos, primero inicia un informe con nota de voz o indica a qué incidencia quieres adjuntarlas (ej: <i>Adjuntar fotos a incidencia Humedad y agua acumulada</i>).",
              );
              res.status(200).send("OK");
              return;
            }
            if (session?.pendingHouseSelection) {
              const list = session.pendingHouseSelection.suggestedMatches
                .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
                .join("\n");
              await send(
                `Primero elige la casa del informe. Responde con el número o nombre:\n\n${list}\n\nDespués podrás subir fotos y crear el informe.`,
              );
              res.status(200).send("OK");
              return;
            }
            const { shouldSendMessage } = await addPhotoUrlMaybeGroup(
              chatId,
              url,
              mediaGroupId,
            );
            if (shouldSendMessage) {
              const updated = await getSession(chatId);
              const count = updated?.photoUrls?.length || 1;
              const label = mediaGroupId
                ? "Fotos añadidas al informe"
                : count > 1
                  ? `Foto añadida (${count} en total)`
                  : "Foto añadida al informe";
              await send(
                `${label}. Envía más fotos o escribe <b>Crear informe</b>.`,
              );
            }
          }
        } catch (err) {
          console.error("Upload photo error:", err);
          await send("No he podido guardar la foto. Inténtalo de nuevo.");
        }
        res.status(200).send("OK");
        return;
      }

      if (!text) {
        await send(
          "Envía un mensaje de texto para consultar el dashboard, una nota de voz para generar un informe de inspección, <b>Crear informe</b> si ya enviaste el audio, o <b>Continuar informe</b> para recuperar uno pendiente.",
        );
        res.status(200).send("OK");
        return;
      }

      const session = await getSession(chatId);
      const isCreateReportCommand =
        /crear\s*informe|generar\s*informe|crear\s*incidencias?|generar\s*incidencias?/i.test(
          text,
        );
      const isRecoveryCommand =
        /continuar\s*(informe)?|informe\s*pendiente|recuperar(\s*informe|\s*audio)?|último\s*(informe|audio)|qué\s*pas[oó]\s*con\s*(mi\s*)?audio/i.test(
          text,
        );
      const incidentNameForPhotos = extractIncidentNameForPhotoCommand(text);
      const isStopIncidentPhotoMode =
        /^(terminar|finalizar|salir|cancelar)\s*(modo|subida|adjuntar)?\s*(fotos?|im[aá]genes?)?$/i.test(
          text.trim(),
        ) || /^terminar\s*fotos$/i.test(text.trim());
      const isConfirmOrCancelCommand =
        /^s[ií]$|^confirmar$|^ok$|^vale$|^correcto$|^no$|^cancelar$|^cancela$/i.test(
          text.trim(),
        );

      // Feedback inmediato para que el usuario sepa que el bot está procesando su petición.
      // Se evita en confirmaciones/cancelaciones para no meter ruido.
      if (!isConfirmOrCancelCommand) {
        await send(
          "Recibido. Estoy revisando la información y te respondo en un momento…",
        );
      }

      if (isStopIncidentPhotoMode && session?.selectedIncidentPhotoTargetId) {
        await clearIncidentPhotoTarget(chatId);
        await send(
          "Perfecto, he salido del modo de subida de fotos para incidencia.",
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Pendiente de elegir incidencia (tras sugerencias por similitud) ———
      if (session?.pendingIncidentPhotoSelection) {
        const { suggestedMatches } = session.pendingIncidentPhotoSelection;
        const input = text.trim().toLowerCase();
        let chosen = null;
        const num = /^\d+$/.test(input) ? parseInt(input, 10) : NaN;
        if (!Number.isNaN(num) && num >= 1 && num <= suggestedMatches.length) {
          chosen = suggestedMatches[num - 1];
        } else {
          chosen = suggestedMatches.find((m) => {
            const title = (m.title || "").trim().toLowerCase();
            return (
              title === input || title.includes(input) || input.includes(title)
            );
          });
        }
        if (chosen) {
          await setSelectedIncidentPhotoTarget(
            chatId,
            user.companyId,
            chosen.id,
            chosen.title || "Incidencia",
          );
          await send(
            `Perfecto. He seleccionado la incidencia <b>${chosen.title || "Incidencia"}</b>. Ahora envíame las fotos y las adjuntaré directamente.`,
          );
        } else {
          const list = suggestedMatches
            .map((m, i) => `${i + 1}) ${m.title || m.id}`)
            .join("\n");
          await send(
            `No he reconocido esa incidencia. Responde con el número (1, 2, …) o el nombre exacto de esta lista:\n\n${list}`,
          );
        }
        res.status(200).send("OK");
        return;
      }

      // ——— Comando para adjuntar fotos a incidencia por nombre ———
      if (incidentNameForPhotos) {
        const incidentName = incidentNameForPhotos;
        const db = admin.firestore();
        const matches = await findIncidentsByCompanyAndName(
          db,
          user.companyId,
          incidentName,
        );
        if (matches.length === 0) {
          const similar = await findSimilarIncidentsByCompanyAndName(
            db,
            user.companyId,
            incidentName,
            6,
          );
          if (similar.length > 0) {
            await setPendingIncidentPhotoSelection(
              chatId,
              user.companyId,
              similar,
              incidentName,
            );
            const list = similar
              .map((m, i) => `${i + 1}) ${m.title || m.id}`)
              .join("\n");
            await send(
              `No encontré una incidencia con el nombre "<i>${incidentName}</i>". ¿Quizá era alguna de estas?\n\n${list}\n\nResponde con el número o con el nombre.`,
            );
          } else {
            await send(
              `No encontré incidencias parecidas a "<i>${incidentName}</i>". Prueba con otro nombre o revisa las incidencias abiertas.`,
            );
          }
          res.status(200).send("OK");
          return;
        }
        if (matches.length > 1) {
          const suggestions = matches.slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title || m.incidence || m.description || m.id,
          }));
          await setPendingIncidentPhotoSelection(
            chatId,
            user.companyId,
            suggestions,
            incidentName,
          );
          const list = suggestions
            .map((m, i) => `${i + 1}) ${m.title}`)
            .join("\n");
          await send(
            `He encontrado varias incidencias con nombres parecidos. Indica cuál es:\n\n${list}\n\nResponde con el número o con el nombre.`,
          );
          res.status(200).send("OK");
          return;
        }
        const found = matches[0];
        const title =
          found.title || found.incidence || found.description || found.id;
        await setSelectedIncidentPhotoTarget(
          chatId,
          user.companyId,
          found.id,
          title,
        );
        await send(
          `Perfecto. Incidencia seleccionada: <b>${title}</b>. Envíame ahora las fotos y las guardaré en esa incidencia.`,
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Recuperar transcripción / informe pendiente ———
      if (isRecoveryCommand) {
        if (!session?.lastTranscription) {
          await send(
            "No tienes ningún informe pendiente. Envía una nota de voz indicando la casa y lo revisado para empezar uno.",
          );
          res.status(200).send("OK");
          return;
        }
        if (session.pendingHouseSelection) {
          const list = session.pendingHouseSelection.suggestedMatches
            .map((m, i) => `${i + 1}) ${m.houseName}`)
            .join("\n");
          await send(
            `Tienes un informe pendiente (audio guardado). Elige la casa:\n\n${list}\n\nResponde con el <b>número</b> (1, 2, …) o el <b>nombre</b> de la casa para continuar.`,
          );
          res.status(200).send("OK");
          return;
        }
        if (session.selectedPropertyId != null) {
          const name = session.selectedPropertyName || "la casa seleccionada";
          const photos =
            (session.photoUrls?.length || 0) > 0
              ? ` (${session.photoUrls.length} foto${session.photoUrls.length !== 1 ? "s" : ""} añadida${session.photoUrls.length !== 1 ? "s" : ""})`
              : "";
          await send(
            `Tienes un informe pendiente para <b>${name}</b>${photos}. Sube más fotos si quieres o escribe <b>Crear informe</b> para generarlo.`,
          );
          res.status(200).send("OK");
          return;
        }
        // Sesión con transcripción pero sin casa asignada: re-aplicar detección de casa (sin volver a transcribir)
        await send("Recuperando tu informe pendiente…");
        const db = admin.firestore();
        const extraction = await extractWithOpenAI(
          apiKey,
          session.lastTranscription,
        );
        const propName = extraction.propertyName?.trim() || "";
        if (!propName) {
          await send(
            "En el audio no se detectó el nombre de la casa. Escribe el nombre de la propiedad para continuar o graba de nuevo.",
          );
          res.status(200).send("OK");
          return;
        }
        const { matchCount, matches } = await findPropertiesByCompanyAndName(
          db,
          session.companyId,
          propName,
        );
        if (matchCount === 0) {
          const similar = await findSimilarPropertiesByCompanyAndName(
            db,
            session.companyId,
            propName,
            6,
          );
          if (similar.length > 0) {
            await setPendingHouseSelection(chatId, similar, propName);
            const list = similar
              .map((m, i) => `${i + 1}) ${m.houseName}`)
              .join("\n");
            await send(
              `No encontré ninguna casa con el nombre "<i>${propName}</i>". ¿Quisiste decir alguna de estas?\n\n${list}\n\nResponde con el número (1, 2, …) o el nombre de la casa para continuar.`,
            );
          } else {
            await send(
              `Sigue sin haber ninguna casa con el nombre "<i>${propName}</i>". Escribe el nombre correcto de la propiedad o graba de nuevo.`,
            );
          }
          res.status(200).send("OK");
          return;
        }
        if (matchCount > 1) {
          await setPendingHouseSelection(chatId, matches, propName);
          const list = matches
            .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
            .join("\n");
          await send(
            `Varias casas coinciden. Elige una:\n\n${list}\n\nResponde con el <b>número</b> (1, 2, …) o el <b>nombre</b> de la casa para continuar.`,
          );
          res.status(200).send("OK");
          return;
        }
        const single = matches[0];
        await setSelectedProperty(
          chatId,
          single.id,
          single.houseName || propName,
        );
        await send(
          `Casa detectada: <b>${single.houseName || propName}</b>. ¿Quieres subir fotos? Envía las imágenes o escribe <b>Crear informe</b> cuando acabes.`,
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Confirmar o cancelar informe pendiente (resumen ya mostrado) ———
      const isConfirmCommand =
        /^s[ií]$|^confirmar$|^ok$|^vale$|^correcto$/i.test(text.trim());
      const isCancelCommand = /^no$|^cancelar$|^cancela$/i.test(text.trim());
      if (session?.pendingReportConfirmation) {
        if (isConfirmCommand) {
          const { pipelineResult, overrideProperty } =
            session.pendingReportConfirmation;
          try {
            const result = await createReportFromPipeline(
              session.companyId,
              pipelineResult,
              session.lastTranscription,
              session.photoUrls || [],
              overrideProperty,
            );
            await send(result.message);
            await clearSession(chatId);
          } catch (err) {
            console.error("Create report on confirm error:", err);
            await send(
              "No he podido crear el informe. Inténtalo de nuevo con <b>Crear informe</b>.",
            );
          }
          res.status(200).send("OK");
          return;
        }
        if (isCancelCommand) {
          await clearPendingReportConfirmation(chatId);
          await send(
            "Informe cancelado. Puedes seguir editando (subir fotos, etc.) y volver a escribir <b>Crear informe</b> cuando quieras.",
          );
          res.status(200).send("OK");
          return;
        }
        await send(
          "Responde <b>Sí</b> o <b>Confirmar</b> para crear el informe, o <b>No</b> / <b>Cancelar</b> para no crearlo.",
        );
        res.status(200).send("OK");
        return;
      }

      // ——— Pendiente de elegir casa (tras "no encontré ninguna casa" con sugerencias) ———
      if (session?.pendingHouseSelection) {
        const { suggestedMatches } = session.pendingHouseSelection;
        if (isCreateReportCommand) {
          await send(
            "Primero indica la casa: responde con el número (1, 2, …) o el nombre de la lista que te envié para continuar con el informe.",
          );
          res.status(200).send("OK");
          return;
        }
        const input = text.trim().toLowerCase();
        let chosen = null;
        const num = /^\d+$/.test(input) ? parseInt(input, 10) : NaN;
        if (!Number.isNaN(num) && num >= 1 && num <= suggestedMatches.length) {
          chosen = suggestedMatches[num - 1];
        } else {
          chosen = suggestedMatches.find(
            (m) =>
              (m.houseName || "").trim().toLowerCase() === input ||
              (m.houseName || "").trim().toLowerCase().includes(input) ||
              input.includes((m.houseName || "").trim().toLowerCase()),
          );
        }
        if (chosen) {
          const houseName = chosen.houseName || chosen.id;
          await setSelectedProperty(chatId, chosen.id, houseName);
          await send(
            `Casa asociada al audio: <b>${houseName}</b>. Ahora puedes subir fotos y, cuando acabes, escribe <b>Crear informe</b>.`,
          );
        } else {
          const list = suggestedMatches
            .map((m, i) => `${i + 1}) ${m.houseName}`)
            .join(", ");
          await send(
            `No he reconocido esa casa. Responde con el número (1, 2, …) o el nombre exacto de la lista:\n${list}`,
          );
        }
        res.status(200).send("OK");
        return;
      }

      // ——— Comando "Crear informe" / "Crear incidencias": generar resumen y pedir confirmación ———
      if (isCreateReportCommand) {
        if (!session?.lastTranscription) {
          await send(
            "Envía primero una nota de voz donde indiques la casa y lo que hayas revisado. Después escribe <b>Crear informe</b>.",
          );
          res.status(200).send("OK");
          return;
        }
        await send("Generando resumen del informe…");
        try {
          const pipelineResult = await runReportPipeline(
            apiKey,
            session.lastTranscription,
            session.photoUrls || [],
            { companyId: session.companyId },
          );
          const overrideProperty =
            session.selectedPropertyId != null
              ? {
                  propertyId: session.selectedPropertyId,
                  propertyName: session.selectedPropertyName || "",
                }
              : null;
          const propertyName =
            overrideProperty?.propertyName || pipelineResult.propertyName || "";
          const issues = pipelineResult.dashboardReport?.issues || [];
          const summaryText =
            pipelineResult.dashboardReport?.summary?.transcriptionSummary?.trim() ||
            "";
          const photoCount = session.photoUrls?.length || 0;

          const lines = [
            `📋 <b>Resumen del informe</b>`,
            `• Casa: ${propertyName || "—"}`,
            summaryText
              ? `• Resumen: ${summaryText.length > 120 ? summaryText.slice(0, 120) + "…" : summaryText}`
              : "",
            issues.length > 0
              ? `• Incidencias detectadas: ${issues.length} — ${issues
                  .slice(0, 5)
                  .map((i) => i.title || "Sin título")
                  .join(", ")}${issues.length > 5 ? "…" : ""}`
              : "• Incidencias detectadas: ninguna",
            `• Fotos: ${photoCount}`,
          ].filter(Boolean);
          await setPendingReportConfirmation(chatId, {
            pipelineResult: {
              propertyName: pipelineResult.propertyName,
              dashboardReport: pipelineResult.dashboardReport,
            },
            overrideProperty,
          });
          await send(
            `${lines.join("\n")}\n\n¿Crear este informe? Responde <b>Sí</b> o <b>Confirmar</b> para crearlo, o <b>No</b> / <b>Cancelar</b> para no crearlo.`,
          );
        } catch (err) {
          console.error("Create report summary error:", err);
          await send(
            "No he podido generar el resumen. Comprueba que en el audio se mencione la casa y lo revisado de forma clara.",
          );
        }
        res.status(200).send("OK");
        return;
      }

      const openAITools = getOpenAITools();
      const runToolFn = (toolName, args) =>
        runTool(user.companyId, toolName, args);
      const answer = await askWithTools(apiKey, text, openAITools, runToolFn);
      await send(answer);
    } catch (err) {
      console.error("Agent error:", err);
      await send("Ahora no puedo procesar la consulta. Inténtalo más tarde.");
    }

    res.status(200).send("OK");
  },
);

module.exports = { telegramWebhook };
