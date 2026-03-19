/**
 * Tool: digest diario por trabajador.
 */
const admin = require('firebase-admin');

function toDate(value) {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function')
    return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : null;
}

function workerName(w) {
  return (
    [w.firstName, w.lastName].filter(Boolean).join(' ').trim() ||
    w.email ||
    w.id
  );
}

const schema = {
  type: 'function',
  function: {
    name: 'dailyDigestByWorker',
    description:
      'Resumen operativo por trabajador: incidencias abiertas asignadas y trabajos del día.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Fecha yyyy-MM-dd. Si no se pasa, hoy.'
        },
        limitWorkers: {
          type: 'number',
          description: 'Máximo de trabajadores a incluir (por defecto 20).'
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
  const limitWorkers = Math.min(
    Math.max(1, Number(args?.limitWorkers) || 20),
    50
  );

  const db = admin.firestore();
  const [workersSnap, incidentsSnap, jobsSnap] = await Promise.all([
    db
      .collection('users')
      .where('role', '==', 'worker')
      .limit(limitWorkers)
      .get(),
    db.collection('incidences').get(),
    db.collection('jobs').get()
  ]);
  const workers = workersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!workers.length) return 'No hay trabajadores para mostrar el digest.';

  const incidents = incidentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const lines = [`Resumen por trabajador (${date}):`];
  workers.forEach(w => {
    const openIncidents = incidents.filter(
      i => !i.done && (i.workersId || []).includes(w.id)
    );
    const todayJobs = jobs.filter(j => {
      if (ymd(j.date) !== date) return false;
      const assigned = (j.workersId || []).includes(w.id);
      const done =
        Boolean(j.done) || j.status === 'done' || j.status === 'cancelled';
      return assigned && !done;
    });
    const overdueJobs = jobs.filter(j => {
      const jd = ymd(j.date);
      if (!jd || jd >= date) return false;
      const assigned = (j.workersId || []).includes(w.id);
      const done =
        Boolean(j.done) || j.status === 'done' || j.status === 'cancelled';
      return assigned && !done;
    });
    lines.push(
      `- ${workerName(w)}: incidencias abiertas ${openIncidents.length}, trabajos hoy ${todayJobs.length}, trabajos atrasados ${overdueJobs.length}.`
    );
  });
  return lines.join('\n');
}

module.exports = { schema, run };
