/**
 * Tool: cierra una incidencia con resumen final.
 */
const admin = require('firebase-admin');

const schema = {
  type: 'function',
  function: {
    name: 'closeIncidentWithSummary',
    description:
      'Cierra una incidencia y guarda un resumen final obligatorio. Opcionalmente añade comentario, tiempo invertido y fotos.',
    parameters: {
      type: 'object',
      properties: {
        incidentId: {
          type: 'string',
          description: 'ID de la incidencia a cerrar.'
        },
        resolutionSummary: {
          type: 'string',
          description: 'Resumen final de resolución (obligatorio).'
        },
        resolutionMinutes: {
          type: 'number',
          description: 'Minutos invertidos en resolverla (opcional).'
        },
        photoUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'URLs de fotos de cierre (opcional).'
        },
        commentText: {
          type: 'string',
          description: 'Comentario adicional al historial (opcional).'
        }
      },
      required: ['incidentId', 'resolutionSummary']
    }
  }
};

async function run(companyId, args) {
  const {
    incidentId,
    resolutionSummary,
    resolutionMinutes,
    photoUrls,
    commentText
  } = args || {};
  if (!incidentId) return 'Falta incidentId.';
  const summary = String(resolutionSummary || '').trim();
  if (!summary)
    return 'resolutionSummary es obligatorio para cerrar la incidencia.';

  const db = admin.firestore();
  const ref = db.collection('incidences').doc(String(incidentId).trim());
  const snap = await ref.get();
  if (!snap.exists) return `No existe la incidencia "${incidentId}".`;
  const data = snap.data() || {};

  const cleanPhotos = Array.isArray(photoUrls)
    ? photoUrls.map(u => String(u || '').trim()).filter(Boolean)
    : [];
  const updates = {
    state: 'done',
    done: true,
    closedAt: admin.firestore.FieldValue.serverTimestamp(),
    stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    resolutionSummary: summary,
    resolutionMinutes:
      Number.isFinite(Number(resolutionMinutes)) &&
      Number(resolutionMinutes) > 0
        ? Number(resolutionMinutes)
        : null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  if (cleanPhotos.length) {
    updates.photos = admin.firestore.FieldValue.arrayUnion(...cleanPhotos);
  }

  const batch = db.batch();
  batch.update(ref, updates);
  batch.set(ref.collection('activity').doc(), {
    type: 'incident_closed',
    summary,
    resolutionMinutes: updates.resolutionMinutes,
    photosAdded: cleanPhotos.length,
    user: { source: 'telegram' },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  if (String(commentText || '').trim()) {
    batch.set(ref.collection('messages').doc(), {
      text: String(commentText).trim(),
      user: { source: 'telegram' },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
  return `Incidencia "${data.title || incidentId}" cerrada correctamente con resumen final.`;
}

module.exports = { schema, run };
