/**
 * Tool: resumen operativo semanal (últimos 7 días).
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

const schema = {
  type: 'function',
  function: {
    name: 'weeklyOpsSummary',
    description:
      'Genera un resumen operativo de los últimos 7 días (incidencias, trabajos y revisiones).',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

async function run(_companyId) {
  const db = admin.firestore();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [incidentsSnap, jobsSnap, checklistsSnap] = await Promise.all([
    db.collection('incidences').get(),
    db.collection('jobs').get(),
    db.collection('checklists').get()
  ]);

  const incidents = incidentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const checklists = checklistsSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const incidentsCreatedWeek = incidents.filter(i => {
    const c = toDate(i.createdAt || i.date);
    return c && c >= sevenDaysAgo;
  });
  const incidentsClosedWeek = incidents.filter(i => {
    if (!i.done) return false;
    const c = toDate(i.closedAt || i.stateUpdatedAt || i.updatedAt);
    return c && c >= sevenDaysAgo;
  });
  const incidentsOpenNow = incidents.filter(i => !i.done).length;

  const jobsCreatedWeek = jobs.filter(j => {
    const c = toDate(j.createdAt || j.date);
    return c && c >= sevenDaysAgo;
  });
  const jobsDoneWeek = jobs.filter(j => {
    if (!(j.done || j.status === 'done')) return false;
    const c = toDate(j.updatedAt || j.date);
    return c && c >= sevenDaysAgo;
  });
  const jobsPendingNow = jobs.filter(
    j => !(j.done || j.status === 'done' || j.status === 'cancelled')
  ).length;

  const checklistsCreatedWeek = checklists.filter(c => {
    const d = toDate(c.createdAt || c.date);
    return d && d >= sevenDaysAgo;
  });
  const checklistsFinishedWeek = checklists.filter(c => {
    if (!c.finished) return false;
    const d = toDate(c.updatedAt || c.date);
    return d && d >= sevenDaysAgo;
  });
  const checklistsOpenNow = checklists.filter(c => !c.finished).length;

  return [
    'Resumen semanal (últimos 7 días):',
    `\u2022 Incidencias creadas: ${incidentsCreatedWeek.length}`,
    `\u2022 Incidencias cerradas: ${incidentsClosedWeek.length}`,
    `\u2022 Incidencias abiertas ahora: ${incidentsOpenNow}`,
    `\u2022 Trabajos creados: ${jobsCreatedWeek.length}`,
    `\u2022 Trabajos finalizados: ${jobsDoneWeek.length}`,
    `\u2022 Trabajos pendientes ahora: ${jobsPendingNow}`,
    `\u2022 Revisiones creadas: ${checklistsCreatedWeek.length}`,
    `\u2022 Revisiones finalizadas: ${checklistsFinishedWeek.length}`,
    `\u2022 Revisiones abiertas ahora: ${checklistsOpenNow}`
  ].join('\n');
}

module.exports = { schema, run };
