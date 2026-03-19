/**
 * Tool: reabre una incidencia cerrada.
 */
const admin = require('firebase-admin');

const schema = {
  type: 'function',
  function: {
    name: 'reopenIncident',
    description:
      'Reabre una incidencia cerrada y registra el motivo en el historial.',
    parameters: {
      type: 'object',
      properties: {
        incidentId: {
          type: 'string',
          description: 'ID de la incidencia a reabrir.'
        },
        reason: {
          type: 'string',
          description: 'Motivo de reapertura.'
        }
      },
      required: ['incidentId', 'reason']
    }
  }
};

async function run(companyId, args) {
  const { incidentId, reason } = args || {};
  if (!incidentId) return 'Falta incidentId.';
  const reasonText = String(reason || '').trim();
  if (!reasonText) return 'Debes indicar reason para reabrir la incidencia.';

  const db = admin.firestore();
  const ref = db.collection('incidences').doc(String(incidentId).trim());
  const snap = await ref.get();
  if (!snap.exists) return `No existe la incidencia "${incidentId}".`;
  const data = snap.data() || {};

  const prevState = data.state || 'done';
  const batch = db.batch();
  batch.update(ref, {
    done: false,
    state: 'iniciada',
    reopenedAt: admin.firestore.FieldValue.serverTimestamp(),
    stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.set(ref.collection('activity').doc(), {
    type: 'incident_reopened',
    fromState: prevState,
    toState: 'iniciada',
    reason: reasonText,
    user: { source: 'telegram' },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  await batch.commit();
  return `Incidencia "${data.title || incidentId}" reabierta correctamente.`;
}

module.exports = { schema, run };
