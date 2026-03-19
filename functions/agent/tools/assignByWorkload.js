/**
 * Tool: autoasigna incidencia al trabajador con menor carga.
 */
const admin = require('firebase-admin');

function workerLabel(w) {
  return (
    [w.firstName, w.lastName].filter(Boolean).join(' ').trim() ||
    w.email ||
    w.id
  );
}

const schema = {
  type: 'function',
  function: {
    name: 'assignByWorkload',
    description:
      'Asigna automáticamente una incidencia al trabajador con menor número de incidencias abiertas.',
    parameters: {
      type: 'object',
      properties: {
        incidentId: {
          type: 'string',
          description: 'ID de la incidencia a asignar.'
        }
      },
      required: ['incidentId']
    }
  }
};

async function run(companyId, args) {
  const { incidentId } = args || {};
  if (!incidentId) return 'Falta incidentId.';
  const db = admin.firestore();
  const incidentRef = db
    .collection('incidences')
    .doc(String(incidentId).trim());
  const incidentSnap = await incidentRef.get();
  if (!incidentSnap.exists) return `No existe la incidencia "${incidentId}".`;
  const incident = incidentSnap.data() || {};

  const [workersSnap, incidentsSnap] = await Promise.all([
    db.collection('users').where('role', '==', 'worker').get(),
    db.collection('incidences').get()
  ]);
  const workers = workersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!workers.length)
    return 'No hay trabajadores disponibles para autoasignar.';

  const openIncidents = incidentsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i => !i.done);
  const load = {};
  workers.forEach(w => {
    load[w.id] = 0;
  });
  openIncidents.forEach(i => {
    (i.workersId || []).forEach(wid => {
      if (load[wid] != null) load[wid] += 1;
    });
  });
  const sorted = workers
    .filter(w => w.id)
    .sort((a, b) => (load[a.id] ?? 0) - (load[b.id] ?? 0));
  const picked = sorted[0];
  if (!picked) return 'No se pudo determinar un trabajador para autoasignar.';

  await incidentRef.update({
    workersId: [picked.id],
    workers: [
      {
        id: picked.id,
        firstName: picked.firstName || '',
        lastName: picked.lastName || '',
        email: picked.email || '',
        role: picked.role || 'worker'
      }
    ],
    state:
      incident.state === 'iniciada' ? 'asignada' : incident.state || 'asignada',
    stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  await incidentRef.collection('activity').add({
    type: 'assignment_change',
    mode: 'auto_by_workload',
    assignedWorkerId: picked.id,
    assignedWorkerName: workerLabel(picked),
    user: { source: 'telegram' },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return `Incidencia "${incident.title || incidentId}" autoasignada a ${workerLabel(picked)} (carga actual: ${load[picked.id] || 0}).`;
}

module.exports = { schema, run };
