/**
 * Tool: obtiene el detalle de un checklist por ID.
 */
const admin = require('firebase-admin');

const schema = {
  type: 'function',
  function: {
    name: 'getChecklistById',
    description:
      'Obtiene el detalle de un checklist (revisión) por su ID: propiedad, fecha, estado (finalizado o no), trabajadores asignados, progreso de checks.',
    parameters: {
      type: 'object',
      properties: {
        checklistId: {
          type: 'string',
          description: 'ID del documento del checklist en Firestore'
        }
      },
      required: ['checklistId']
    }
  }
};

async function run(companyId, args) {
  const { checklistId } = args || {};
  if (!checklistId) {
    return 'Falta checklistId.';
  }
  const db = admin.firestore();
  const ref = db.collection('checklists').doc(checklistId);
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ningún checklist con ID "${checklistId}".`;
  }
  const data = snap.data();
  const houseName =
    data.house?.[0]?.houseName ||
    data.house?.houseName ||
    data.houseId ||
    '\u2014';
  const dateStr = data.date?.toDate
    ? data.date.toDate().toISOString().slice(0, 10)
    : data.date?.seconds
      ? new Date(data.date.seconds * 1000).toISOString().slice(0, 10)
      : '\u2014';
  const lines = [
    `ID: ${snap.id}`,
    `Propiedad: ${houseName}`,
    `Fecha: ${dateStr}`,
    `Finalizado: ${data.finished ? 'Sí' : 'No'}`,
    `Progreso: ${data.done ?? 0} / ${data.total ?? 0} puntos`
  ];
  if (data.observations) {
    lines.push(`Observaciones: ${String(data.observations).slice(0, 200)}`);
  }
  if (data.workersId?.length) {
    const workers = await Promise.all(
      data.workersId
        .slice(0, 5)
        .map(uid => db.collection('users').doc(uid).get())
    );
    const names = workers
      .filter(w => w.exists)
      .map(w => {
        const d = w.data();
        return [d.firstName, d.lastName].filter(Boolean).join(' ') || d.email;
      });
    lines.push(`Asignados: ${names.join(', ') || '\u2014'}`);
  }
  return lines.join('\n');
}

module.exports = { schema, run };
