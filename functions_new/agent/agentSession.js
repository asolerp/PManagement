/**
 * Sesión del agente por chat (para guardar última transcripción y fotos antes de "Crear incidencias").
 * Colección: agentSessions, docId = String(chatId).
 */

const admin = require("firebase-admin");

const COLLECTION = "agentSessions";
const TTL_MINUTES = 60;

function docRef(chatId) {
  return admin.firestore().collection(COLLECTION).doc(String(chatId));
}

/**
 * Guarda la transcripción como última entrada de la sesión.
 * @param {string|number} chatId
 * @param {string} companyId
 * @param {string} transcription
 */
async function setTranscription(chatId, companyId, transcription) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      companyId,
      lastTranscription: transcription,
      photoUrls: [],
      pendingHouseSelection: admin.firestore.FieldValue.delete(),
      selectedPropertyId: admin.firestore.FieldValue.delete(),
      selectedPropertyName: admin.firestore.FieldValue.delete(),
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetName: admin.firestore.FieldValue.delete(),
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Guarda sugerencias de casas similares cuando no hubo coincidencia exacta (esperando que el usuario elija).
 * @param {string|number} chatId
 * @param {Array<{ id: string, houseName: string }>} suggestedMatches
 * @param {string} extractedPropertyName
 */
async function setPendingHouseSelection(
  chatId,
  suggestedMatches,
  extractedPropertyName,
) {
  const ref = docRef(chatId);
  await ref.update({
    pendingHouseSelection: {
      suggestedMatches: suggestedMatches || [],
      extractedPropertyName: extractedPropertyName || "",
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Marca la casa elegida por el usuario y limpia pendingHouseSelection para continuar con fotos / Crear informe.
 * @param {string|number} chatId
 * @param {string} propertyId
 * @param {string} houseName
 */
async function setSelectedProperty(chatId, propertyId, houseName) {
  const ref = docRef(chatId);
  await ref.update({
    pendingHouseSelection: admin.firestore.FieldValue.delete(),
    selectedPropertyId: propertyId || null,
    selectedPropertyName: houseName || "",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Guarda el resumen del informe pendiente de confirmación (antes de crear).
 * @param {string|number} chatId
 * @param {{ pipelineResult: { propertyName: string, dashboardReport: object }, overrideProperty: { propertyId: string, propertyName: string }|null }} payload
 */
async function setPendingReportConfirmation(chatId, payload) {
  const ref = docRef(chatId);
  await ref.update({
    pendingReportConfirmation: payload || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Quita la confirmación pendiente (sin borrar el resto de la sesión).
 * @param {string|number} chatId
 */
async function clearPendingReportConfirmation(chatId) {
  const ref = docRef(chatId);
  await ref.update({
    pendingReportConfirmation: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Guarda sugerencias de incidencias similares para adjuntar fotos.
 * @param {string|number} chatId
 * @param {string} companyId
 * @param {Array<{ id: string, title: string }>} suggestedMatches
 * @param {string} extractedIncidentName
 */
async function setPendingIncidentPhotoSelection(
  chatId,
  companyId,
  suggestedMatches,
  extractedIncidentName,
) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      companyId,
      pendingIncidentPhotoSelection: {
        suggestedMatches: suggestedMatches || [],
        extractedIncidentName: extractedIncidentName || "",
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Marca la incidencia seleccionada para recibir fotos desde Telegram.
 * @param {string|number} chatId
 * @param {string} companyId
 * @param {string} incidentId
 * @param {string} incidentName
 */
async function setSelectedIncidentPhotoTarget(
  chatId,
  companyId,
  incidentId,
  incidentName,
) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      companyId,
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: incidentId || null,
      selectedIncidentPhotoTargetName: incidentName || "",
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Limpia el modo de subida de fotos a incidencia.
 * @param {string|number} chatId
 */
async function clearIncidentPhotoTarget(chatId) {
  const ref = docRef(chatId);
  await ref.set(
    {
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetName: admin.firestore.FieldValue.delete(),
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Marca recepción de foto para incidencia, controlando media_group_id (álbum).
 * @param {string|number} chatId
 * @param {string|null} mediaGroupId
 * @returns {Promise<{ shouldSendMessage: boolean }>}
 */
async function markIncidentPhotoReceivedMaybeGroup(chatId, mediaGroupId) {
  const ref = docRef(chatId);
  if (!mediaGroupId) {
    await ref.set(
      {
        lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { shouldSendMessage: true };
  }

  const alreadyRepliedForThisGroup = await admin
    .firestore()
    .runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      const wasAlreadyReplied =
        data.lastIncidentMediaGroupIdReplied === mediaGroupId;
      const updates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (!wasAlreadyReplied) {
        updates.lastIncidentMediaGroupIdReplied = mediaGroupId;
      }
      tx.set(ref, updates, { merge: true });
      return wasAlreadyReplied;
    });
  return { shouldSendMessage: !alreadyRepliedForThisGroup };
}

/**
 * Recupera la sesión del chat (transcripción y companyId).
 * @param {string|number} chatId
 * @returns {Promise<{ companyId: string, lastTranscription: string|null } | null>}
 */
async function getSession(chatId) {
  const ref = docRef(chatId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data();
  const updatedAt = data.updatedAt?.toDate?.() ?? null;
  if (updatedAt && Date.now() - updatedAt.getTime() > TTL_MINUTES * 60 * 1000) {
    await ref.delete();
    return null;
  }
  if (!data.companyId) return null;
  return {
    companyId: data.companyId,
    lastTranscription: data.lastTranscription || null,
    photoUrls: data.photoUrls || [],
    pendingHouseSelection: data.pendingHouseSelection || null,
    selectedPropertyId: data.selectedPropertyId || null,
    selectedPropertyName: data.selectedPropertyName || null,
    pendingReportConfirmation: data.pendingReportConfirmation || null,
    pendingIncidentPhotoSelection: data.pendingIncidentPhotoSelection || null,
    selectedIncidentPhotoTargetId: data.selectedIncidentPhotoTargetId || null,
    selectedIncidentPhotoTargetName:
      data.selectedIncidentPhotoTargetName || null,
    lastMediaGroupIdReplied: data.lastMediaGroupIdReplied || null,
    lastIncidentMediaGroupIdReplied:
      data.lastIncidentMediaGroupIdReplied || null,
  };
}

/**
 * Añade una URL de foto a la sesión (tras subirla a Storage).
 * @param {string|number} chatId
 * @param {string} url
 */
async function addPhotoUrl(chatId, url) {
  const ref = docRef(chatId);
  await ref.update({
    photoUrls: admin.firestore.FieldValue.arrayUnion(url),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Añade una foto que puede ser parte de un álbum (media_group_id).
 * Solo la primera foto del grupo debe provocar un mensaje al usuario; el resto no.
 * @param {string|number} chatId
 * @param {string} url
 * @param {string|null} mediaGroupId - Si viene de un mensaje con media_group_id (álbum de Telegram)
 * @returns {Promise<{ shouldSendMessage: boolean }>} - true solo para la primera del grupo o foto suelta
 */
async function addPhotoUrlMaybeGroup(chatId, url, mediaGroupId) {
  const ref = docRef(chatId);
  if (!mediaGroupId) {
    await ref.update({
      photoUrls: admin.firestore.FieldValue.arrayUnion(url),
      lastMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { shouldSendMessage: true };
  }
  const alreadyRepliedForThisGroup = await admin
    .firestore()
    .runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      const wasAlreadyReplied = data.lastMediaGroupIdReplied === mediaGroupId;
      const updates = {
        photoUrls: admin.firestore.FieldValue.arrayUnion(url),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (!wasAlreadyReplied) {
        updates.lastMediaGroupIdReplied = mediaGroupId;
      }
      tx.update(ref, updates);
      return wasAlreadyReplied;
    });
  return { shouldSendMessage: !alreadyRepliedForThisGroup };
}

/**
 * Borra la sesión tras procesar (crear incidencias / generar informe).
 * @param {string|number} chatId
 */
async function clearSession(chatId) {
  await docRef(chatId).delete();
}

module.exports = {
  setTranscription,
  getSession,
  clearSession,
  addPhotoUrl,
  addPhotoUrlMaybeGroup,
  setPendingHouseSelection,
  setSelectedProperty,
  setPendingReportConfirmation,
  clearPendingReportConfirmation,
  setPendingIncidentPhotoSelection,
  setSelectedIncidentPhotoTarget,
  clearIncidentPhotoTarget,
  markIncidentPhotoReceivedMaybeGroup,
};
