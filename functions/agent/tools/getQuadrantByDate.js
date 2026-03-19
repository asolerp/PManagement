/**
 * Tool: obtiene el cuadrante de un día (trabajadores, casas y franjas horarias).
 */
const admin = require('firebase-admin');
const { formatTime } = require('./formatTime');

const schema = {
  type: 'function',
  function: {
    name: 'getQuadrantByDate',
    description:
      'Obtiene el cuadrante (asignación de trabajadores a casas con horarios) para una fecha. Respuesta: por trabajador, lista de casas con hora inicio-fin.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description:
            'Fecha en formato yyyy-MM-dd (ej: 2025-03-08). Si no se pasa, se usa hoy.'
        }
      },
      required: []
    }
  }
};

async function run(companyId, args) {
  const date =
    args?.date && /^\d{4}-\d{2}-\d{2}$/.test(args.date)
      ? args.date
      : new Date().toISOString().slice(0, 10);
  const db = admin.firestore();
  const quadrantsSnap = await db
    .collection('quadrants')
    .where('date', '==', date)
    .get();
  const quadrants = quadrantsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (quadrants.length === 0) {
    return `Cuadrante del ${date}: no hay cuadrante para esta fecha.`;
  }
  const q = quadrants[0];
  const jobsSnap = await db
    .collection('quadrants')
    .doc(q.id)
    .collection('jobs')
    .get();
  const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  jobs.sort((a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0));
  const byWorker = new Map();
  for (const j of jobs) {
    const wid = j.worker?.id ?? j.workersId?.[0] ?? '_';
    if (!byWorker.has(wid)) byWorker.set(wid, []);
    byWorker.get(wid).push(j);
  }
  const workerLines = [];
  for (const [, workerJobs] of byWorker) {
    const name =
      workerJobs[0]?.worker?.firstName || workerJobs[0]?.worker?.lastName
        ? [workerJobs[0].worker.firstName, workerJobs[0].worker.lastName]
            .filter(Boolean)
            .join(' ')
        : '?';
    const slots = workerJobs
      .map(j => {
        const houseName = j.house?.houseName || j.houseId || '?';
        return `${houseName} (${formatTime(j.startHour)}–${formatTime(j.endHour)})`;
      })
      .join(', ');
    workerLines.push(`- ${name}: ${slots}`);
  }
  return `Cuadrante del ${date}:\n${workerLines.join('\n')}`;
}

module.exports = { schema, run };
