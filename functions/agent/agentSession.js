/**
 * Sesión del agente por chat (para guardar última transcripción y fotos antes de "Crear incidencias").
 * Colección: agentSessions, docId = String(chatId).
 * Adaptado para single-tenant: companyId se mantiene por compatibilidad pero no se filtra.
 */

const admin = require('firebase-admin');

const COLLECTION = 'agentSessions';
const TTL_MINUTES = 60;

function docRef(chatId) {
  return admin.firestore().collection(COLLECTION).doc(String(chatId));
}

async function setTranscription(chatId, _companyId, transcription) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      lastTranscription: transcription,
      photoUrls: [],
      pendingHouseSelection: admin.firestore.FieldValue.delete(),
      selectedPropertyId: admin.firestore.FieldValue.delete(),
      selectedPropertyName: admin.firestore.FieldValue.delete(),
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetName: admin.firestore.FieldValue.delete(),
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function setPendingHouseSelection(
  chatId,
  suggestedMatches,
  extractedPropertyName
) {
  const ref = docRef(chatId);
  await ref.update({
    pendingHouseSelection: {
      suggestedMatches: suggestedMatches || [],
      extractedPropertyName: extractedPropertyName || ''
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function setSelectedProperty(chatId, propertyId, houseName) {
  const ref = docRef(chatId);
  await ref.update({
    pendingHouseSelection: admin.firestore.FieldValue.delete(),
    selectedPropertyId: propertyId || null,
    selectedPropertyName: houseName || '',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function setPendingReportConfirmation(chatId, payload) {
  const ref = docRef(chatId);
  await ref.update({
    pendingReportConfirmation: payload || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function clearPendingReportConfirmation(chatId) {
  const ref = docRef(chatId);
  await ref.update({
    pendingReportConfirmation: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function setPendingIncidentCreationFromReport(chatId, payload) {
  const ref = docRef(chatId);
  await ref.update({
    pendingIncidentCreationFromReport: payload || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function clearPendingIncidentCreationFromReport(chatId) {
  const ref = docRef(chatId);
  await ref.update({
    pendingIncidentCreationFromReport: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function setPendingIncidentPhotoSelection(
  chatId,
  _companyId,
  suggestedMatches,
  extractedIncidentName
) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      pendingIncidentPhotoSelection: {
        suggestedMatches: suggestedMatches || [],
        extractedIncidentName: extractedIncidentName || ''
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function setSelectedIncidentPhotoTarget(
  chatId,
  _companyId,
  incidentId,
  incidentName
) {
  const ref = docRef(chatId);
  await ref.set(
    {
      chatId: String(chatId),
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: incidentId || null,
      selectedIncidentPhotoTargetName: incidentName || '',
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function clearIncidentPhotoTarget(chatId) {
  const ref = docRef(chatId);
  await ref.set(
    {
      pendingIncidentPhotoSelection: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetId: admin.firestore.FieldValue.delete(),
      selectedIncidentPhotoTargetName: admin.firestore.FieldValue.delete(),
      lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function markIncidentPhotoReceivedMaybeGroup(chatId, mediaGroupId) {
  const ref = docRef(chatId);
  if (!mediaGroupId) {
    await ref.set(
      {
        lastIncidentMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return { shouldSendMessage: true };
  }

  const alreadyRepliedForThisGroup = await admin
    .firestore()
    .runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      const wasAlreadyReplied =
        data.lastIncidentMediaGroupIdReplied === mediaGroupId;
      const updates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (!wasAlreadyReplied) {
        updates.lastIncidentMediaGroupIdReplied = mediaGroupId;
      }
      tx.set(ref, updates, { merge: true });
      return wasAlreadyReplied;
    });
  return { shouldSendMessage: !alreadyRepliedForThisGroup };
}

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
  return {
    lastTranscription: data.lastTranscription || null,
    photoUrls: data.photoUrls || [],
    pendingHouseSelection: data.pendingHouseSelection || null,
    selectedPropertyId: data.selectedPropertyId || null,
    selectedPropertyName: data.selectedPropertyName || null,
    pendingReportConfirmation: data.pendingReportConfirmation || null,
    pendingIncidentCreationFromReport:
      data.pendingIncidentCreationFromReport || null,
    pendingIncidentPhotoSelection: data.pendingIncidentPhotoSelection || null,
    selectedIncidentPhotoTargetId: data.selectedIncidentPhotoTargetId || null,
    selectedIncidentPhotoTargetName:
      data.selectedIncidentPhotoTargetName || null,
    lastMediaGroupIdReplied: data.lastMediaGroupIdReplied || null,
    lastIncidentMediaGroupIdReplied:
      data.lastIncidentMediaGroupIdReplied || null,
    conversationHistory: data.conversationHistory || []
  };
}

async function addPhotoUrl(chatId, url) {
  const ref = docRef(chatId);
  await ref.update({
    photoUrls: admin.firestore.FieldValue.arrayUnion(url),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function addPhotoUrlMaybeGroup(chatId, url, mediaGroupId) {
  const ref = docRef(chatId);
  if (!mediaGroupId) {
    await ref.update({
      photoUrls: admin.firestore.FieldValue.arrayUnion(url),
      lastMediaGroupIdReplied: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { shouldSendMessage: true };
  }
  const alreadyRepliedForThisGroup = await admin
    .firestore()
    .runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      const wasAlreadyReplied = data.lastMediaGroupIdReplied === mediaGroupId;
      const updates = {
        photoUrls: admin.firestore.FieldValue.arrayUnion(url),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (!wasAlreadyReplied) {
        updates.lastMediaGroupIdReplied = mediaGroupId;
      }
      tx.update(ref, updates);
      return wasAlreadyReplied;
    });
  return { shouldSendMessage: !alreadyRepliedForThisGroup };
}

async function clearSession(chatId) {
  await docRef(chatId).delete();
}

const MAX_HISTORY_MESSAGES = 10;

async function appendConversationToHistory(chatId, role, content) {
  const ref = docRef(chatId);
  const snap = await ref.get();
  const data = snap.data() || {};
  let history = Array.isArray(data.conversationHistory)
    ? data.conversationHistory
    : [];
  history.push({ role, content: String(content || '').slice(0, 2000) });
  if (history.length > MAX_HISTORY_MESSAGES) {
    history = history.slice(-MAX_HISTORY_MESSAGES);
  }
  await ref.set(
    {
      conversationHistory: history,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
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
  setPendingIncidentCreationFromReport,
  clearPendingIncidentCreationFromReport,
  setPendingIncidentPhotoSelection,
  setSelectedIncidentPhotoTarget,
  clearIncidentPhotoTarget,
  markIncidentPhotoReceivedMaybeGroup,
  appendConversationToHistory
};
