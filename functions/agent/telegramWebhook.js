/**
 * Webhook HTTP para Telegram Bot.
 * POST: recibe el update, resuelve usuario por telegramId, LLM + tools, envía respuesta.
 * Adaptado para single-tenant: sin companyId en queries. Colección incidences en vez de incidents.
 */

const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const { REGION } = require('../utils');
const { telegramBotToken, openaiApiKey } = require('./config');
const {
  sendMessage,
  sendMessageWithKeyboard,
  answerCallbackQuery,
  sendTypingAction
} = require('./telegramApi');
const { askWithTools, naturalReply } = require('./llm');
const { getOpenAITools, runTool } = require('./tools');
const { downloadTelegramFile } = require('./telegramMedia');
const { transcribe } = require('./transcribe');
const {
  setTranscription,
  getSession,
  clearSession,
  addPhotoUrlMaybeGroup,
  setPendingHouseSelection,
  setSelectedProperty,
  setPendingReportConfirmation,
  clearPendingReportConfirmation,
  setPendingIncidentCreationFromReport,
  setPendingIncidentPhotoSelection,
  setSelectedIncidentPhotoTarget,
  clearIncidentPhotoTarget,
  markIncidentPhotoReceivedMaybeGroup,
  appendConversationToHistory
} = require('./agentSession');
const {
  extractWithOpenAI
} = require('./reportPipeline/extraction/OpenAIExtractionAdapter');
const { runReportPipeline } = require('./reportPipeline/runReportPipeline');
const {
  createReportFromPipeline,
  findPropertiesByCompanyAndName,
  findSimilarPropertiesByCompanyAndName
} = require('./createInspectionReport');
const { uploadPhotoToStorage } = require('./uploadPhotoToStorage');
const { getCompanyContext } = require('./getCompanyContext');
const {
  extractFromTranscription,
  createIncidencesFromExtraction
} = require('./extractAndCreateIncidences');

const TELEGRAM_HTML_TAG_RE = /<\/?(b|i|code|pre|u|s|a)\b/i;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToTelegramHtml(rawText) {
  let text = escapeHtml(rawText);
  text = text.replace(
    /^#{1,6}\s+(.+)$/gm,
    (_, title) => `<b>${title.trim()}</b>`
  );
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  text = text.replace(/^\s*-\s+/gm, '• ');
  return text;
}

function formatTelegramMessage(message) {
  const text = String(message || '').trim();
  if (!text) return '';
  if (TELEGRAM_HTML_TAG_RE.test(text)) return text;
  return markdownToTelegramHtml(text);
}

function buildProfessionalReportMessage({
  propertyName,
  reportHeader,
  summaryText,
  tasksPerformed,
  issues,
  photoCount,
  consolidatedActions,
  finalStatus
}) {
  const lines = [];
  lines.push(
    `📋 <b>${escapeHtml(reportHeader?.title || `INFORME DE REVISIÓN - ${propertyName || 'PROPIEDAD'}`)}</b>`
  );
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📅 ${escapeHtml(formatReportDate(new Date()))}`);
  lines.push(
    `👤 ${escapeHtml(reportHeader?.responsible || 'Equipo Port Management')}`
  );
  lines.push(`📍 ${escapeHtml(reportHeader?.location || propertyName || '—')}`);
  if (summaryText) {
    lines.push('');
    lines.push('📝 <b>Resumen general</b>');
    lines.push(escapeHtml(summaryText));
  }
  if (Array.isArray(tasksPerformed) && tasksPerformed.length > 0) {
    lines.push('');
    lines.push('✅ <b>Tareas realizadas</b>');
    tasksPerformed.slice(0, 8).forEach(t => lines.push(`• ${escapeHtml(t)}`));
  }
  lines.push('');
  lines.push(`⚠️ <b>Incidencias detectadas (${issues.length})</b>`);
  const grouped = {};
  for (const issue of issues) {
    const key = issue.location || 'Sin ubicación';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(issue);
  }
  Object.entries(grouped).forEach(([location, locIssues]) => {
    lines.push('');
    lines.push(`🔸 <b>${escapeHtml(location)}</b>`);
    locIssues.slice(0, 4).forEach(i => {
      lines.push(escapeHtml(i.title || 'Sin título'));
      if (i.priority) lines.push(`Prioridad: ${escapeHtml(i.priority)}`);
    });
  });
  lines.push('');
  lines.push(
    `📸 Material gráfico: ${photoCount} foto${photoCount !== 1 ? 's' : ''}`
  );
  if (Array.isArray(consolidatedActions) && consolidatedActions.length > 0) {
    lines.push('');
    lines.push('🔧 <b>Acciones recomendadas</b>');
    consolidatedActions.slice(0, 8).forEach((a, idx) => {
      lines.push(`${idx + 1}. ${escapeHtml(a)}`);
    });
  }
  if (finalStatus) {
    lines.push('');
    lines.push('📊 <b>Estado final</b>');
    lines.push(escapeHtml(finalStatus));
  }
  let message = lines.join('\n');
  if (message.length > 3900) {
    message = `${message.slice(0, 3800)}\n\n<i>…Informe truncado por longitud. Consulta el detalle completo en el dashboard.</i>`;
  }
  return message;
}

function formatReportDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/**
 * Resuelve telegramId a usuario (users collection).
 * Single-tenant: no necesita companyId.
 */
async function resolveUserByTelegramId(telegramId) {
  const snap = await admin
    .firestore()
    .collection('users')
    .where('telegramId', '==', String(telegramId))
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  return {
    uid: doc.id,
    role: data.role || null,
    displayName:
      [data.firstName, data.lastName].filter(Boolean).join(' ') ||
      data.name ||
      data.displayName ||
      data.email ||
      ''
  };
}

const MAX_INCIDENTS_SEARCH = 120;
const MAX_INCIDENTS_SUGGESTIONS = 6;

function similarityScore(name, search) {
  if (!search) return 0;
  const n = (name || '').trim().toLowerCase();
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

async function findIncidentsByName(db, incidentName) {
  const snap = await db
    .collection('incidences')
    .limit(MAX_INCIDENTS_SEARCH)
    .get();
  const search = (incidentName || '').trim().toLowerCase();
  if (!search) return [];
  const matches = snap.docs.filter(d => {
    const data = d.data();
    const title = (data.title || '').toLowerCase();
    const description = (
      data.incidence ||
      data.description ||
      ''
    ).toLowerCase();
    return title.includes(search) || description.includes(search);
  });
  return matches.map(d => ({ id: d.id, ...d.data() }));
}

async function findSimilarIncidentsByName(
  db,
  incidentName,
  limit = MAX_INCIDENTS_SUGGESTIONS
) {
  const snap = await db
    .collection('incidences')
    .limit(MAX_INCIDENTS_SEARCH)
    .get();
  const search = (incidentName || '').trim();
  if (!search) return [];
  const scored = snap.docs.map(d => {
    const data = d.data();
    const title = data.title || data.incidence || data.description || d.id;
    const score = Math.max(
      similarityScore(title, search),
      similarityScore(data.incidence || data.description || '', search)
    );
    return { id: d.id, title, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(x => x.score > 0).slice(0, limit);
}

function extractIncidentNameForPhotoCommand(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;
  const patterns = [
    /(?:adjuntar|subir|sube|enviar|manda|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s*(?:la\s*)?incidencia\s+(.+)$/i,
    /(?:adjuntar|subir|sube|enviar|manda|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s+(.+)$/i,
    /(?:quiero|puedo|necesito)\s+(?:adjuntar|subir|enviar|a[nñ]adir|agregar|poner|cargar)\s+(?:fotos?|im[aá]genes?)\s+(?:a|en|para|de)?\s+(.+)$/i
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = m[1]
        .trim()
        .replace(/^la\s+incidencia\s+/i, '')
        .replace(/^incidencia\s+/i, '')
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
    memory: '256MiB',
    invoker: 'public',
    secrets: [telegramBotToken, openaiApiKey]
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(200).send('OK');
      return;
    }

    const update = req.body;
    const message = update?.message;
    const callbackQuery = update?.callback_query;
    const chatId = message?.chat?.id ?? callbackQuery?.message?.chat?.id;
    const text = message?.text?.trim();
    const fromId = message?.from?.id ?? callbackQuery?.from?.id;
    const voice = message?.voice;

    if (!chatId || !fromId) {
      res.status(200).send('OK');
      return;
    }

    const botToken = telegramBotToken.value();
    const apiKey = openaiApiKey.value();
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      res.status(500).send('Bot not configured');
      return;
    }
    if (!apiKey) {
      console.error('OPENAI_API_KEY not set');
      await sendMessage(
        botToken,
        chatId,
        'El agente no está configurado (falta clave de IA).'
      ).catch(() => {});
      res.status(200).send('OK');
      return;
    }

    const send = msg =>
      sendMessage(botToken, chatId, formatTelegramMessage(msg)).catch(e =>
        console.error('Telegram send error:', e)
      );

    try {
      const user = await resolveUserByTelegramId(fromId);
      if (!user) {
        await send(
          `👋 <b>¡Bienvenido a Port Management!</b>\n\n` +
            `Soy el asistente de inteligencia artificial de Port Management. ` +
            `Puedo ayudarte a gestionar propiedades, crear informes de inspección, ` +
            `consultar incidencias y mucho más.\n\n` +
            `Para empezar a usar el bot, necesitas que un administrador vincule tu cuenta.\n\n` +
            `📋 <b>Tu ID de Telegram:</b> <code>${fromId}</code>\n\n` +
            `Copia este ID y envíaselo a tu administrador para que lo asocie a tu usuario en el panel de gestión.`
        );
        res.status(200).send('OK');
        return;
      }

      const SINGLE_TENANT_ID = 'default';

      // ——— Comandos /start, /help, /cancel ———
      const cmd = (text || '').toLowerCase().split(/\s+/)[0];
      if (cmd === '/start') {
        await send(
          'Hola, soy el asistente de Port Management. Puedes:\n\n' +
            '• Enviar una <b>nota de voz</b> para crear un informe de inspección\n' +
            '• Enviar <b>fotos</b> para añadirlas al informe o a una incidencia\n' +
            '• Escribir consultas: "¿Qué incidencias hay abiertas?", "Resumen del día", etc.\n\n' +
            'Escribe <b>/help</b> para más opciones o <b>/cancel</b> para cancelar un flujo en curso.'
        );
        res.status(200).send('OK');
        return;
      }
      if (cmd === '/help') {
        await send(
          '<b>Comandos:</b>\n' +
            '• <b>/start</b> — Bienvenida\n' +
            '• <b>/menu</b> — Menú principal\n' +
            '• <b>/help</b> — Esta ayuda\n' +
            '• <b>/cancel</b> — Cancelar informe pendiente o modo fotos\n\n' +
            '<b>Informes:</b> Envía nota de voz indicando la casa y lo revisado. Luego fotos si quieres. Escribe <b>Crear informe</b> para generarlo.\n\n' +
            '<b>Consultas:</b> Pregunta por incidencias, cuadrante, trabajos, propiedades, etc.'
        );
        res.status(200).send('OK');
        return;
      }
      if (cmd === '/menu') {
        const menuKeyboard = [
          [
            {
              text: '🏠 Listar casas',
              callback_data: 'menu_list_houses'
            }
          ],
          [
            {
              text: '⚠️ Incidencias abiertas',
              callback_data: 'menu_open_incidents'
            }
          ],
          [
            {
              text: '📋 Cuadrante del día',
              callback_data: 'menu_today_quadrant'
            }
          ],
          [
            {
              text: '🎙️ Nuevo informe (audio)',
              callback_data: 'menu_new_report'
            }
          ],
          [
            {
              text: '❓ Ayuda',
              callback_data: 'menu_help'
            }
          ]
        ];
        await sendMessageWithKeyboard(
          botToken,
          chatId,
          '<b>📌 Menú Principal</b>\n\nElige una opción o escríbeme directamente lo que necesites:',
          menuKeyboard
        );
        res.status(200).send('OK');
        return;
      }
      if (cmd === '/cancel') {
        const session = await getSession(chatId);
        if (
          session?.lastTranscription ||
          session?.pendingHouseSelection ||
          session?.pendingReportConfirmation ||
          session?.pendingIncidentCreationFromReport ||
          session?.selectedIncidentPhotoTargetId
        ) {
          await clearSession(chatId);
          await send(
            'He cancelado el flujo. Puedes empezar de nuevo cuando quieras.'
          );
        } else {
          await send('No hay nada que cancelar.');
        }
        res.status(200).send('OK');
        return;
      }

      // ——— Callback de teclado inline ———
      if (callbackQuery) {
        const callbackId = callbackQuery.id;
        const data = callbackQuery.data || '';
        await answerCallbackQuery(botToken, callbackId);

        // ——— Callbacks del menú principal ———
        if (data === 'menu_list_houses') {
          await sendTypingAction(botToken, chatId);
          const openAITools = getOpenAITools();
          const runToolFn = (toolName, args) => runTool(null, toolName, args);
          const answer = await askWithTools(
            apiKey,
            'Lista todas las casas/propiedades disponibles',
            openAITools,
            runToolFn,
            '',
            []
          );
          await send(answer);
          res.status(200).send('OK');
          return;
        }
        if (data === 'menu_open_incidents') {
          await sendTypingAction(botToken, chatId);
          const openAITools = getOpenAITools();
          const runToolFn = (toolName, args) => runTool(null, toolName, args);
          const answer = await askWithTools(
            apiKey,
            '¿Qué incidencias hay abiertas actualmente?',
            openAITools,
            runToolFn,
            '',
            []
          );
          await send(answer);
          res.status(200).send('OK');
          return;
        }
        if (data === 'menu_today_quadrant') {
          await sendTypingAction(botToken, chatId);
          const openAITools = getOpenAITools();
          const runToolFn = (toolName, args) => runTool(null, toolName, args);
          const answer = await askWithTools(
            apiKey,
            '¿Cuál es el cuadrante de trabajo de hoy?',
            openAITools,
            runToolFn,
            '',
            []
          );
          await send(answer);
          res.status(200).send('OK');
          return;
        }
        if (data === 'menu_new_report') {
          await send(
            '🎙️ <b>Nuevo informe de inspección</b>\n\n' +
              'Envía una <b>nota de voz</b> indicando:\n' +
              '• La <b>casa</b> que has inspeccionado\n' +
              '• Lo que has <b>revisado</b> y observado\n\n' +
              'Después podrás subir <b>fotos</b> y escribir <b>Crear informe</b> para generarlo.'
          );
          res.status(200).send('OK');
          return;
        }
        if (data === 'menu_help') {
          await send(
            '<b>Comandos:</b>\n' +
              '• <b>/start</b> — Bienvenida\n' +
              '• <b>/menu</b> — Menú principal\n' +
              '• <b>/help</b> — Esta ayuda\n' +
              '• <b>/cancel</b> — Cancelar flujo en curso\n\n' +
              '<b>Informes:</b> Envía nota de voz indicando la casa y lo revisado. Luego fotos si quieres. Escribe <b>Crear informe</b> para generarlo.\n\n' +
              '<b>Consultas:</b> Pregunta por incidencias, cuadrante, trabajos, propiedades, etc.'
          );
          res.status(200).send('OK');
          return;
        }

        const session = await getSession(chatId);
        if (data === 'report_confirm' && session?.pendingReportConfirmation) {
          const { pipelineResult, overrideProperty } =
            session.pendingReportConfirmation;
          try {
            const propertyName =
              overrideProperty?.propertyName ||
              pipelineResult.propertyName ||
              '';
            const fullReportMessage = buildProfessionalReportMessage({
              propertyName,
              reportHeader: {
                title:
                  pipelineResult.dashboardReport?.report_header?.title ||
                  `INFORME DE REVISIÓN - ${propertyName || 'PROPIEDAD'}`,
                responsible: user.displayName || 'Equipo Port Management',
                location:
                  pipelineResult.dashboardReport?.report_header?.location ||
                  propertyName ||
                  '—'
              },
              summaryText:
                pipelineResult.dashboardReport?.summary?.transcriptionSummary ||
                '',
              tasksPerformed:
                pipelineResult.dashboardReport?.tasks_performed || [],
              issues: pipelineResult.dashboardReport?.issues || [],
              photoCount: session.photoUrls?.length || 0,
              consolidatedActions:
                pipelineResult.dashboardReport?.consolidated_actions || [],
              finalStatus: pipelineResult.dashboardReport?.final_status || ''
            });
            const result = await createReportFromPipeline(
              null,
              pipelineResult,
              session.lastTranscription,
              session.photoUrls || [],
              overrideProperty,
              { responsibleName: user.displayName || '' }
            );
            await send(fullReportMessage);
            await send(result.message);
            await clearPendingReportConfirmation(chatId);
            const incidencesKeyboard = [
              [
                {
                  text: 'Sí, crear incidencias',
                  callback_data: 'incidences_confirm'
                },
                { text: 'No, gracias', callback_data: 'incidences_cancel' }
              ]
            ];
            await setPendingIncidentCreationFromReport(chatId, {
              transcription: session.lastTranscription,
              photoUrls: session.photoUrls || [],
              overrideProperty
            });
            await sendMessageWithKeyboard(
              botToken,
              chatId,
              '¿Quieres crear incidencias a partir de este informe?',
              incidencesKeyboard
            ).catch(e => {
              console.error('Keyboard send error:', e);
              send(
                '¿Quieres crear incidencias? Escribe "Crear incidencias" o "No" para continuar.'
              );
            });
          } catch (err) {
            console.error('Create report on confirm error:', err);
            await send(
              'No he podido crear el informe. Inténtalo de nuevo con <b>Crear informe</b>.'
            );
          }
          res.status(200).send('OK');
          return;
        }
        if (data === 'report_cancel' && session?.pendingReportConfirmation) {
          await clearPendingReportConfirmation(chatId);
          await send(
            'Informe cancelado. Puedes seguir editando (subir fotos, etc.) y volver a escribir <b>Crear informe</b> cuando quieras.'
          );
          res.status(200).send('OK');
          return;
        }
        if (
          data === 'incidences_confirm' &&
          session?.pendingIncidentCreationFromReport
        ) {
          await sendTypingAction(botToken, chatId);
          const { transcription, photoUrls, overrideProperty } =
            session.pendingIncidentCreationFromReport;
          try {
            const runToolFn = (name, args) => runTool(null, name, args);
            const extraction = await extractFromTranscription(
              apiKey,
              transcription
            );
            const result = await createIncidencesFromExtraction(
              null,
              extraction,
              runToolFn,
              photoUrls || [],
              overrideProperty
            );
            await send(result.message);
          } catch (err) {
            console.error('Create incidences from report error:', err);
            await send(
              'No he podido crear las incidencias. Puedes crearlas manualmente desde el dashboard.'
            );
          }
          await clearSession(chatId);
          res.status(200).send('OK');
          return;
        }
        if (
          data === 'incidences_cancel' &&
          session?.pendingIncidentCreationFromReport
        ) {
          await clearSession(chatId);
          await send('De acuerdo. Si necesitas algo más, aquí estoy.');
          res.status(200).send('OK');
          return;
        }
        const houseMatch = data.match(/^house_(\d+)$/);
        if (houseMatch && session?.pendingHouseSelection) {
          const idx = parseInt(houseMatch[1], 10);
          const { suggestedMatches } = session.pendingHouseSelection;
          if (idx >= 0 && idx < suggestedMatches.length) {
            const chosen = suggestedMatches[idx];
            await setSelectedProperty(
              chatId,
              chosen.id,
              chosen.houseName || chosen.id
            );
            const houseName = chosen.houseName || chosen.id;
            await send(
              `Casa asociada al audio: <b>${houseName}</b>. Ahora puedes subir fotos y, cuando acabes, escribe <b>Crear informe</b>.`
            );
          } else {
            await send('No he reconocido esa opción. Inténtalo de nuevo.');
          }
          res.status(200).send('OK');
          return;
        }
        await send('Ese botón ya no es válido. Inténtalo de nuevo.');
        res.status(200).send('OK');
        return;
      }

      // ——— Nota de voz ———
      if (voice?.file_id) {
        await sendTypingAction(botToken, chatId);
        const analyzingMsg = await naturalReply(
          apiKey,
          'El usuario acaba de enviar una nota de voz. Genera un mensaje breve y amigable indicando que estás analizando el audio para el informe (1 frase).'
        );
        await send(analyzingMsg || 'Analizando tu audio…');
        const { buffer, extension } = await downloadTelegramFile(
          botToken,
          voice.file_id,
          'voice'
        );
        const transcription = await transcribe(
          apiKey,
          buffer,
          `voice.${extension}`
        );
        await setTranscription(chatId, SINGLE_TENANT_ID, transcription);

        const db = admin.firestore();
        const extraction = await extractWithOpenAI(apiKey, transcription);
        const { matchCount, matches } = await findPropertiesByCompanyAndName(
          db,
          null,
          extraction.propertyName || ''
        );

        if (!extraction.propertyName?.trim()) {
          const reply = await naturalReply(
            apiKey,
            'He analizado el audio del usuario pero no he conseguido detectar el nombre de ninguna casa/propiedad. Necesito que vuelva a grabar mencionando la propiedad. El audio previo ya está guardado.'
          );
          await send(
            reply ||
              'No he detectado el nombre de la casa en el audio. Graba de nuevo indicando la propiedad.'
          );
          res.status(200).send('OK');
          return;
        }
        if (matchCount === 0) {
          const similar = await findSimilarPropertiesByCompanyAndName(
            db,
            null,
            extraction.propertyName.trim(),
            6
          );
          if (similar.length > 0) {
            await setPendingHouseSelection(
              chatId,
              similar,
              extraction.propertyName.trim()
            );
            const list = similar
              .map((m, i) => `${i + 1}) ${m.houseName}`)
              .join('\n');
            const keyboard = similar.slice(0, 6).map((m, i) => [
              {
                text: `${i + 1}. ${(m.houseName || m.id).slice(0, 35)}`,
                callback_data: `house_${i}`
              }
            ]);
            await sendMessageWithKeyboard(
              botToken,
              chatId,
              `No encontré "${extraction.propertyName.trim()}". ¿Alguna de estas?\n\n${list}\n\nElige con el botón o responde con el número/nombre.`,
              keyboard
            ).catch(e => {
              console.error('Keyboard send error:', e);
              send(
                `No encontré "${extraction.propertyName.trim()}". ¿Alguna de estas?\n\n${list}\n\nResponde con el número o nombre.`
              );
            });
          } else {
            const reply = await naturalReply(
              apiKey,
              `El usuario dijo "${extraction.propertyName.trim()}" pero no existe ninguna casa con ese nombre ni parecidas en la base de datos.`
            );
            await send(
              reply ||
                `No encontré ninguna casa con el nombre "${extraction.propertyName.trim()}".`
            );
          }
          res.status(200).send('OK');
          return;
        }
        if (matchCount > 1) {
          await setPendingHouseSelection(
            chatId,
            matches,
            extraction.propertyName.trim()
          );
          const list = matches
            .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
            .join('\n');
          const keyboard = matches.slice(0, 6).map((m, i) => [
            {
              text: `${i + 1}. ${(m.houseName || m.id).slice(0, 35)}`,
              callback_data: `house_${i}`
            }
          ]);
          await sendMessageWithKeyboard(
            botToken,
            chatId,
            `Varias casas coinciden con "<i>${extraction.propertyName.trim()}</i>". Elige una:\n\n${list}\n\nO elige con el botón. El audio ya está guardado.`,
            keyboard
          ).catch(e => {
            console.error('Keyboard send error:', e);
            send(
              `Varias casas coinciden: ${list}\n\nResponde con el número o nombre.`
            );
          });
          res.status(200).send('OK');
          return;
        }
        const singleMatch = matches[0];
        await setSelectedProperty(
          chatId,
          singleMatch.id,
          singleMatch.houseName || extraction.propertyName
        );
        const houseName = singleMatch.houseName || extraction.propertyName;
        const reply = await naturalReply(
          apiKey,
          `He identificado la casa "${houseName}" del audio del usuario. Ahora puede enviar fotos o escribir "Crear informe" para generar el reporte.`
        );
        await send(
          reply ||
            `Casa detectada: <b>${houseName}</b>. Envía fotos o escribe <b>Crear informe</b>.`
        );
        res.status(200).send('OK');
        return;
      }

      // ——— Foto(s) ———
      const photo = message?.photo;
      const mediaGroupId = message?.media_group_id || null;
      if (photo?.length) {
        const session = await getSession(chatId);
        const fileId = photo[photo.length - 1].file_id;
        try {
          const { buffer } = await downloadTelegramFile(
            botToken,
            fileId,
            'photo'
          );
          const url = await uploadPhotoToStorage(null, buffer, 'image/jpeg');

          if (session?.selectedIncidentPhotoTargetId) {
            const db = admin.firestore();
            const incidentRef = db
              .collection('incidences')
              .doc(session.selectedIncidentPhotoTargetId);
            const incidentSnap = await incidentRef.get();
            if (!incidentSnap.exists) {
              await clearIncidentPhotoTarget(chatId);
              await send(
                'La incidencia seleccionada ya no existe. Indica de nuevo el nombre de la incidencia para adjuntar fotos.'
              );
              res.status(200).send('OK');
              return;
            }

            await incidentRef.update({
              photos: admin.firestore.FieldValue.arrayUnion(url),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            await incidentRef.collection('activity').add({
              type: 'photo_added',
              source: 'telegram',
              photoUrl: url,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const { shouldSendMessage } =
              await markIncidentPhotoReceivedMaybeGroup(chatId, mediaGroupId);
            if (shouldSendMessage) {
              const name =
                session.selectedIncidentPhotoTargetName ||
                'la incidencia seleccionada';
              await send(
                `Foto${mediaGroupId ? 's' : ''} añadida${mediaGroupId ? 's' : ''} a <b>${name}</b>. Puedes seguir enviando imágenes o escribir <b>Terminar fotos</b> para salir de este modo.`
              );
            }
          } else {
            if (!session?.lastTranscription) {
              const reply = await naturalReply(
                apiKey,
                'El usuario envió una foto pero no tiene ningún informe activo ni incidencia seleccionada. Necesita primero enviar una nota de voz para iniciar un informe, o indicar a qué incidencia quiere adjuntar fotos.'
              );
              await send(
                reply ||
                  'Primero inicia un informe con nota de voz o indica a qué incidencia adjuntar las fotos.'
              );
              res.status(200).send('OK');
              return;
            }
            if (session?.pendingHouseSelection) {
              const list = session.pendingHouseSelection.suggestedMatches
                .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
                .join('\n');
              await send(
                `Primero elige la casa del informe. Responde con el número o nombre:\n\n${list}\n\nDespués podrás subir fotos y crear el informe.`
              );
              res.status(200).send('OK');
              return;
            }
            const { shouldSendMessage } = await addPhotoUrlMaybeGroup(
              chatId,
              url,
              mediaGroupId
            );
            if (shouldSendMessage) {
              const updated = await getSession(chatId);
              const count = updated?.photoUrls?.length || 1;
              const label = mediaGroupId
                ? 'Fotos añadidas al informe'
                : count > 1
                  ? `Foto añadida (${count} en total)`
                  : 'Foto añadida al informe';
              await send(
                `${label}. Envía más fotos o escribe <b>Crear informe</b>.`
              );
            }
          }
        } catch (err) {
          console.error('Upload photo error:', err);
          await send('No he podido guardar la foto. Inténtalo de nuevo.');
        }
        res.status(200).send('OK');
        return;
      }

      if (!text) {
        const reply = await naturalReply(
          apiKey,
          'El usuario ha enviado algo que no es texto ni audio ni foto. Necesito explicarle que puede enviarme texto para consultas, notas de voz para informes de inspección, o fotos.'
        );
        await send(
          reply ||
            'Envíame un texto, nota de voz o foto para que pueda ayudarte.'
        );
        res.status(200).send('OK');
        return;
      }

      const session = await getSession(chatId);
      const isCreateReportCommand =
        /(?:crear|generar)\s*(?:el\s*)?informe|(?:dale|vale|ok|vamos)\s*(?:a\s*)?(?:crear|generar)(?:\s*el)?\s*informe|crear\s*incidencias?|generar\s*incidencias?/i.test(
          text
        );
      const isRecoveryCommand =
        /continuar\s*(informe)?|informe\s*pendiente|recuperar(\s*informe|\s*audio)?|último\s*(informe|audio)|qué\s*pas[oó]\s*con\s*(mi\s*)?audio|seguir\s*(con\s*)?(?:el\s*)?informe/i.test(
          text
        );
      const incidentNameForPhotos = extractIncidentNameForPhotoCommand(text);
      const isStopIncidentPhotoMode =
        /^(terminar|finalizar|salir|cancelar)\s*(modo|subida|adjuntar)?\s*(fotos?|im[aá]genes?)?$/i.test(
          text.trim()
        ) || /^terminar\s*fotos$/i.test(text.trim());
      await sendTypingAction(botToken, chatId);

      if (isStopIncidentPhotoMode && session?.selectedIncidentPhotoTargetId) {
        await clearIncidentPhotoTarget(chatId);
        await send(
          'Perfecto, he salido del modo de subida de fotos para incidencia.'
        );
        res.status(200).send('OK');
        return;
      }

      // ——— Pendiente de elegir incidencia ———
      if (session?.pendingIncidentPhotoSelection) {
        const { suggestedMatches } = session.pendingIncidentPhotoSelection;
        const input = text.trim().toLowerCase();
        let chosen = null;
        const num = /^\d+$/.test(input) ? parseInt(input, 10) : NaN;
        if (!Number.isNaN(num) && num >= 1 && num <= suggestedMatches.length) {
          chosen = suggestedMatches[num - 1];
        } else {
          chosen = suggestedMatches.find(m => {
            const title = (m.title || '').trim().toLowerCase();
            return (
              title === input || title.includes(input) || input.includes(title)
            );
          });
        }
        if (chosen) {
          await setSelectedIncidentPhotoTarget(
            chatId,
            null,
            chosen.id,
            chosen.title || 'Incidencia'
          );
          await send(
            `Perfecto. He seleccionado la incidencia <b>${chosen.title || 'Incidencia'}</b>. Ahora envíame las fotos y las adjuntaré directamente.`
          );
        } else {
          const list = suggestedMatches
            .map((m, i) => `${i + 1}) ${m.title || m.id}`)
            .join('\n');
          await send(
            `No he reconocido esa incidencia. Responde con el número (1, 2, …) o el nombre exacto de esta lista:\n\n${list}`
          );
        }
        res.status(200).send('OK');
        return;
      }

      // ——— Comando para adjuntar fotos a incidencia por nombre ———
      if (incidentNameForPhotos) {
        const incidentName = incidentNameForPhotos;
        const db = admin.firestore();
        const matches = await findIncidentsByName(db, incidentName);
        if (matches.length === 0) {
          const similar = await findSimilarIncidentsByName(db, incidentName, 6);
          if (similar.length > 0) {
            await setPendingIncidentPhotoSelection(
              chatId,
              null,
              similar,
              incidentName
            );
            const list = similar
              .map((m, i) => `${i + 1}) ${m.title || m.id}`)
              .join('\n');
            await send(
              `No encontré una incidencia con el nombre "<i>${incidentName}</i>". ¿Quizá era alguna de estas?\n\n${list}\n\nResponde con el número o con el nombre.`
            );
          } else {
            await send(
              `No encontré incidencias parecidas a "<i>${incidentName}</i>". Prueba con otro nombre o revisa las incidencias abiertas.`
            );
          }
          res.status(200).send('OK');
          return;
        }
        if (matches.length > 1) {
          const suggestions = matches.slice(0, 6).map(m => ({
            id: m.id,
            title: m.title || m.incidence || m.description || m.id
          }));
          await setPendingIncidentPhotoSelection(
            chatId,
            null,
            suggestions,
            incidentName
          );
          const list = suggestions
            .map((m, i) => `${i + 1}) ${m.title}`)
            .join('\n');
          await send(
            `He encontrado varias incidencias con nombres parecidos. Indica cuál es:\n\n${list}\n\nResponde con el número o con el nombre.`
          );
          res.status(200).send('OK');
          return;
        }
        const found = matches[0];
        const title =
          found.title || found.incidence || found.description || found.id;
        await setSelectedIncidentPhotoTarget(chatId, null, found.id, title);
        await send(
          `Perfecto. Incidencia seleccionada: <b>${title}</b>. Envíame ahora las fotos y las guardaré en esa incidencia.`
        );
        res.status(200).send('OK');
        return;
      }

      // ——— Recuperar informe pendiente ———
      if (isRecoveryCommand) {
        if (!session?.lastTranscription) {
          await send(
            'No tienes ningún informe pendiente. Envía una nota de voz indicando la casa y lo revisado para empezar uno.'
          );
          res.status(200).send('OK');
          return;
        }
        if (session.pendingHouseSelection) {
          const list = session.pendingHouseSelection.suggestedMatches
            .map((m, i) => `${i + 1}) ${m.houseName}`)
            .join('\n');
          await send(
            `Tienes un informe pendiente (audio guardado). Elige la casa:\n\n${list}\n\nResponde con el <b>número</b> (1, 2, …) o el <b>nombre</b> de la casa para continuar.`
          );
          res.status(200).send('OK');
          return;
        }
        if (session.selectedPropertyId != null) {
          const name = session.selectedPropertyName || 'la casa seleccionada';
          const photos =
            (session.photoUrls?.length || 0) > 0
              ? ` (${session.photoUrls.length} foto${session.photoUrls.length !== 1 ? 's' : ''} añadida${session.photoUrls.length !== 1 ? 's' : ''})`
              : '';
          await send(
            `Tienes un informe pendiente para <b>${name}</b>${photos}. Sube más fotos si quieres o escribe <b>Crear informe</b> para generarlo.`
          );
          res.status(200).send('OK');
          return;
        }
        await sendTypingAction(botToken, chatId);
        const recoveringMsg = await naturalReply(
          apiKey,
          'El usuario quiere recuperar su informe pendiente. Genera un mensaje breve (1 frase) indicando que estás recuperándolo.'
        );
        await send(recoveringMsg || 'Recuperando tu informe pendiente…');
        const db = admin.firestore();
        const extraction = await extractWithOpenAI(
          apiKey,
          session.lastTranscription
        );
        const propName = extraction.propertyName?.trim() || '';
        if (!propName) {
          await send(
            'En el audio no se detectó el nombre de la casa. Escribe el nombre de la propiedad para continuar o graba de nuevo.'
          );
          res.status(200).send('OK');
          return;
        }
        const { matchCount, matches } = await findPropertiesByCompanyAndName(
          db,
          null,
          propName
        );
        if (matchCount === 0) {
          const similar = await findSimilarPropertiesByCompanyAndName(
            db,
            null,
            propName,
            6
          );
          if (similar.length > 0) {
            await setPendingHouseSelection(chatId, similar, propName);
            const list = similar
              .map((m, i) => `${i + 1}) ${m.houseName}`)
              .join('\n');
            const keyboard = similar.slice(0, 6).map((m, i) => [
              {
                text: `${i + 1}. ${(m.houseName || m.id).slice(0, 35)}`,
                callback_data: `house_${i}`
              }
            ]);
            await sendMessageWithKeyboard(
              botToken,
              chatId,
              `No encontré ninguna casa con el nombre "<i>${propName}</i>". ¿Quisiste decir alguna de estas?\n\n${list}\n\nElige con el botón o responde con el número/nombre.`,
              keyboard
            ).catch(e => {
              console.error('Keyboard send error:', e);
              send(
                `No encontré ninguna casa con el nombre "<i>${propName}</i>". ¿Quisiste decir alguna de estas?\n\n${list}\n\nResponde con el número o nombre.`
              );
            });
          } else {
            await send(
              `Sigue sin haber ninguna casa con el nombre "<i>${propName}</i>". Escribe el nombre correcto de la propiedad o graba de nuevo.`
            );
          }
          res.status(200).send('OK');
          return;
        }
        if (matchCount > 1) {
          await setPendingHouseSelection(chatId, matches, propName);
          const list = matches
            .map((m, i) => `${i + 1}) ${m.houseName || m.id}`)
            .join('\n');
          const keyboard = matches.slice(0, 6).map((m, i) => [
            {
              text: `${i + 1}. ${(m.houseName || m.id).slice(0, 35)}`,
              callback_data: `house_${i}`
            }
          ]);
          await sendMessageWithKeyboard(
            botToken,
            chatId,
            `Varias casas coinciden. Elige una:\n\n${list}\n\nO elige con el botón.`,
            keyboard
          ).catch(e => {
            console.error('Keyboard send error:', e);
            send(
              `Varias casas coinciden. Elige una:\n\n${list}\n\nResponde con el número o nombre.`
            );
          });
          res.status(200).send('OK');
          return;
        }
        const single = matches[0];
        await setSelectedProperty(
          chatId,
          single.id,
          single.houseName || propName
        );
        await send(
          `Casa detectada: <b>${single.houseName || propName}</b>. ¿Quieres subir fotos? Envía las imágenes o escribe <b>Crear informe</b> cuando acabes.`
        );
        res.status(200).send('OK');
        return;
      }

      // ——— Confirmar / cancelar (usado en varios flujos) ———
      const isConfirmCommand =
        /^s[ií]$|^confirmar$|^ok$|^vale$|^correcto$/i.test(text.trim());
      const isCancelCommand = /^no$|^cancelar$|^cancela$/i.test(text.trim());

      // ——— Pendiente de crear incidencias desde informe ———
      const isCreateIncidencesCommand =
        /crear\s*incidencias?|generar\s*incidencias?|s[ií]$|^confirmar$|^ok$|^vale$/i.test(
          text.trim()
        );
      if (session?.pendingIncidentCreationFromReport) {
        if (isCreateIncidencesCommand) {
          await sendTypingAction(botToken, chatId);
          const { transcription, photoUrls, overrideProperty } =
            session.pendingIncidentCreationFromReport;
          try {
            const runToolFn = (name, args) => runTool(null, name, args);
            const extraction = await extractFromTranscription(
              apiKey,
              transcription
            );
            const result = await createIncidencesFromExtraction(
              null,
              extraction,
              runToolFn,
              photoUrls || [],
              overrideProperty
            );
            await send(result.message);
          } catch (err) {
            console.error('Create incidences from report error:', err);
            await send(
              'No he podido crear las incidencias. Puedes crearlas manualmente desde el dashboard.'
            );
          }
          await clearSession(chatId);
        } else if (isCancelCommand) {
          await clearSession(chatId);
          await send('De acuerdo. Si necesitas algo más, aquí estoy.');
        } else {
          await send(
            '¿Quieres crear incidencias a partir del informe? Responde <b>Sí</b> / <b>Crear incidencias</b> o <b>No</b> / <b>Cancelar</b>.'
          );
        }
        res.status(200).send('OK');
        return;
      }

      // ——— Confirmar o cancelar informe pendiente ———
      if (session?.pendingReportConfirmation) {
        if (isConfirmCommand) {
          const { pipelineResult, overrideProperty } =
            session.pendingReportConfirmation;
          try {
            const propertyName =
              overrideProperty?.propertyName ||
              pipelineResult.propertyName ||
              '';
            const fullReportMessage = buildProfessionalReportMessage({
              propertyName,
              reportHeader: {
                title:
                  pipelineResult.dashboardReport?.report_header?.title ||
                  `INFORME DE REVISIÓN - ${propertyName || 'PROPIEDAD'}`,
                responsible: user.displayName || 'Equipo Port Management',
                location:
                  pipelineResult.dashboardReport?.report_header?.location ||
                  propertyName ||
                  '—'
              },
              summaryText:
                pipelineResult.dashboardReport?.summary?.transcriptionSummary ||
                '',
              tasksPerformed:
                pipelineResult.dashboardReport?.tasks_performed || [],
              issues: pipelineResult.dashboardReport?.issues || [],
              photoCount: session.photoUrls?.length || 0,
              consolidatedActions:
                pipelineResult.dashboardReport?.consolidated_actions || [],
              finalStatus: pipelineResult.dashboardReport?.final_status || ''
            });
            const result = await createReportFromPipeline(
              null,
              pipelineResult,
              session.lastTranscription,
              session.photoUrls || [],
              overrideProperty,
              { responsibleName: user.displayName || '' }
            );
            await send(fullReportMessage);
            await send(result.message);
            await clearPendingReportConfirmation(chatId);
            await setPendingIncidentCreationFromReport(chatId, {
              transcription: session.lastTranscription,
              photoUrls: session.photoUrls || [],
              overrideProperty
            });
            const incidencesKeyboard = [
              [
                {
                  text: 'Sí, crear incidencias',
                  callback_data: 'incidences_confirm'
                },
                { text: 'No, gracias', callback_data: 'incidences_cancel' }
              ]
            ];
            await sendMessageWithKeyboard(
              botToken,
              chatId,
              '¿Quieres crear incidencias a partir de este informe?',
              incidencesKeyboard
            ).catch(e => {
              console.error('Keyboard send error:', e);
              send(
                '¿Quieres crear incidencias? Escribe "Crear incidencias" o "No" para continuar.'
              );
            });
          } catch (err) {
            console.error('Create report on confirm error:', err);
            await send(
              'No he podido crear el informe. Inténtalo de nuevo con <b>Crear informe</b>.'
            );
          }
          res.status(200).send('OK');
          return;
        }
        if (isCancelCommand) {
          await clearPendingReportConfirmation(chatId);
          await send(
            'Informe cancelado. Puedes seguir editando (subir fotos, etc.) y volver a escribir <b>Crear informe</b> cuando quieras.'
          );
          res.status(200).send('OK');
          return;
        }
        await send(
          'Responde <b>Sí</b> o <b>Confirmar</b> para crear el informe, o <b>No</b> / <b>Cancelar</b> para no crearlo.'
        );
        res.status(200).send('OK');
        return;
      }

      // ——— Pendiente de elegir casa ———
      if (session?.pendingHouseSelection) {
        const { suggestedMatches } = session.pendingHouseSelection;
        const normalizedText = text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        const isGeneralQuery =
          /list(ar|a|e|ado)|muestra|ensena|ver\s+(todas|casas)|todas(\s+las)?\s*(casas|propiedades)?|cu[aá]ntas\s+casas|propiedades|que\s+casas\s+hay/.test(
            normalizedText
          );
        if (!isGeneralQuery) {
          if (isCreateReportCommand) {
            const reply = await naturalReply(
              apiKey,
              'El usuario quiere crear el informe pero aún no ha elegido la casa. Debe elegir una de la lista primero.'
            );
            await send(
              reply || 'Primero elige la casa de la lista para continuar.'
            );
            res.status(200).send('OK');
            return;
          }
          const input = text.trim().toLowerCase();
          let chosen = null;
          const num = /^\d+$/.test(input) ? parseInt(input, 10) : NaN;
          if (
            !Number.isNaN(num) &&
            num >= 1 &&
            num <= suggestedMatches.length
          ) {
            chosen = suggestedMatches[num - 1];
          } else {
            chosen = suggestedMatches.find(
              m =>
                (m.houseName || '').trim().toLowerCase() === input ||
                (m.houseName || '').trim().toLowerCase().includes(input) ||
                input.includes((m.houseName || '').trim().toLowerCase())
            );
          }
          if (chosen) {
            await setSelectedProperty(
              chatId,
              chosen.id,
              chosen.houseName || chosen.id
            );
            const houseName = chosen.houseName || chosen.id;
            const reply = await naturalReply(
              apiKey,
              `El usuario ha elegido la casa "${houseName}". Confirmar que el audio del informe se ha asociado a esa casa. Ahora puede subir fotos y después escribir "Crear informe".`
            );
            await send(
              reply ||
                `Casa asociada al audio: <b>${houseName}</b>. Ahora puedes subir fotos y, cuando acabes, escribe <b>Crear informe</b>.`
            );
          } else {
            const list = suggestedMatches
              .map((m, i) => `${i + 1}) ${m.houseName}`)
              .join(', ');
            const reply = await naturalReply(
              apiKey,
              `El usuario escribió "${text}" pero no coincide con ninguna de las casas sugeridas: ${list}. Puedo listarle todas las casas si lo necesita, o que elija de la lista.`
            );
            await send(
              reply || `No he reconocido esa casa. Las opciones son:\n${list}`
            );
          }
          res.status(200).send('OK');
          return;
        }
        // Si pide listar casas, dejamos que el LLM con tools lo maneje
      }

      // ——— Comando "Crear informe" ———
      if (isCreateReportCommand) {
        if (!session?.lastTranscription) {
          await send(
            'Envía primero una nota de voz donde indiques la casa y lo que hayas revisado. Después escribe <b>Crear informe</b>.'
          );
          res.status(200).send('OK');
          return;
        }
        await sendTypingAction(botToken, chatId);
        const generatingMsg = await naturalReply(
          apiKey,
          'El usuario va a crear un informe. Genera un mensaje breve (1 frase) indicando que estás generando el resumen.'
        );
        await send(generatingMsg || 'Generando resumen del informe…');
        try {
          const pipelineResult = await runReportPipeline(
            apiKey,
            session.lastTranscription,
            session.photoUrls || [],
            {
              responsibleName: user.displayName || '',
              reportDate: new Date().toISOString(),
              location: session.selectedPropertyName || ''
            }
          );
          const overrideProperty =
            session.selectedPropertyId != null
              ? {
                  propertyId: session.selectedPropertyId,
                  propertyName: session.selectedPropertyName || ''
                }
              : null;
          const propertyName =
            overrideProperty?.propertyName || pipelineResult.propertyName || '';
          const issues = pipelineResult.dashboardReport?.issues || [];
          const summaryText =
            pipelineResult.dashboardReport?.summary?.transcriptionSummary?.trim() ||
            '';
          const photoCount = session.photoUrls?.length || 0;
          const reportHeader = {
            title:
              pipelineResult.dashboardReport?.report_header?.title ||
              `INFORME DE REVISIÓN - ${propertyName || 'PROPIEDAD'}`,
            responsible: user.displayName || 'Equipo Port Management',
            location:
              pipelineResult.dashboardReport?.report_header?.location ||
              propertyName ||
              '—'
          };
          const tasksPerformed =
            pipelineResult.dashboardReport?.tasks_performed || [];
          const consolidatedActions =
            pipelineResult.dashboardReport?.consolidated_actions || [];
          const finalStatus =
            pipelineResult.dashboardReport?.final_status || '';
          const previewMessage = buildProfessionalReportMessage({
            propertyName,
            reportHeader,
            summaryText,
            tasksPerformed,
            issues,
            photoCount,
            consolidatedActions,
            finalStatus
          });
          await setPendingReportConfirmation(chatId, {
            pipelineResult: {
              propertyName: pipelineResult.propertyName,
              dashboardReport: pipelineResult.dashboardReport
            },
            overrideProperty
          });
          const confirmKeyboard = [
            [
              { text: 'Sí, crear', callback_data: 'report_confirm' },
              { text: 'No, cancelar', callback_data: 'report_cancel' }
            ]
          ];
          await sendMessageWithKeyboard(
            botToken,
            chatId,
            `${previewMessage}\n\n¿Crear este informe?`,
            confirmKeyboard
          ).catch(e => {
            console.error('Keyboard send error:', e);
            send(
              `${previewMessage}\n\n¿Crear este informe? Responde <b>Sí</b> o <b>Confirmar</b> para crearlo, o <b>No</b> / <b>Cancelar</b> para no crearlo.`
            );
          });
        } catch (err) {
          console.error('Create report summary error:', err);
          await send(
            'No he podido generar el resumen. Comprueba que en el audio se mencione la casa y lo revisado de forma clara.'
          );
        }
        res.status(200).send('OK');
        return;
      }

      const openAITools = getOpenAITools();
      const runToolFn = (toolName, args) => runTool(null, toolName, args);
      const dateStr = new Date().toISOString().slice(0, 10);
      const systemContext = await getCompanyContext(null, dateStr).catch(
        () => ''
      );
      const history = session?.conversationHistory || [];
      const answer = await askWithTools(
        apiKey,
        text,
        openAITools,
        runToolFn,
        systemContext,
        history
      );
      await send(answer);
      await appendConversationToHistory(chatId, 'user', text);
      await appendConversationToHistory(chatId, 'assistant', answer);
    } catch (err) {
      console.error('Agent error:', err);
      const errReply = await naturalReply(
        apiKey,
        'Ha ocurrido un error interno. Genera un mensaje breve y amigable pidiendo disculpas y sugiriendo que intente de nuevo en unos minutos.'
      ).catch(() => null);
      await send(
        errReply ||
          'Lo siento, ha ocurrido un error. Inténtalo de nuevo en unos minutos.'
      );
    }

    res.status(200).send('OK');
  }
);

module.exports = { telegramWebhook };
