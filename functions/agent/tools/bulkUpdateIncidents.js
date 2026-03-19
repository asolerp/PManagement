/**
 * Tool: actualización masiva de incidencias.
 */
const admin = require('firebase-admin');

const VALID_STATES = [
  'iniciada',
  'asignada',
  'process',
  'en_espera',
  'done',
  'cancelada'
];

function normalizeState(value) {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (v === 'finalizada' || v === 'cerrada') return 'done';
  if (v === 'proceso') return 'process';
  if (v === 'espera') return 'en_espera';
  return VALID_STATES.includes(v) ? v : null;
}

const schema = {
  type: 'function',
  function: {
    name: 'bulkUpdateIncidents',
    description:
      'Actualiza varias incidencias por IDs: estado común y/o comentario común.',
    parameters: {
      type: 'object',
      properties: {
        incidentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de IDs de incidencias a actualizar.'
        },
        newState: {
          type: 'string',
          description: 'Nuevo estado común (opcional).'
        },
        commentText: {
          type: 'string',
          description: 'Comentario común para todas (opcional).'
        }
      },
      required: ['incidentIds']
    }
  }
};

async function run(companyId, args) {
  const ids = Array.isArray(args?.incidentIds)
    ? [
        ...new Set(
          args.incidentIds.map(x => String(x || '').trim()).filter(Boolean)
        )
      ]
    : [];
  if (ids.length === 0) return 'Debes indicar incidentIds.';

  const state = normalizeState(args?.newState);
  if (args?.newState != null && args?.newState !== '' && !state) {
    return `Estado "${args.newState}" no válido. Usa: ${VALID_STATES.join(', ')}.`;
  }
  const comment = String(args?.commentText || '').trim();
  if (!state && !comment) {
    return 'Indica newState y/o commentText para aplicar la actualización masiva.';
  }

  const db = admin.firestore();
  let updated = 0;
  let skipped = 0;
  for (const id of ids) {
    const ref = db.collection('incidences').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      skipped += 1;
      continue;
    }
    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (state) {
      updates.state = state;
      updates.done = state === 'done' || state === 'cancelada';
      updates.stateUpdatedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    await ref.update(updates);
    await ref.collection('activity').add({
      type: 'bulk_update',
      newState: state || null,
      comment: comment || null,
      user: { source: 'telegram' },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    if (comment) {
      await ref.collection('messages').add({
        text: comment,
        user: { source: 'telegram' },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    updated += 1;
  }
  return `Actualización masiva completada. Actualizadas: ${updated}. Omitidas: ${skipped}.`;
}

module.exports = { schema, run };
