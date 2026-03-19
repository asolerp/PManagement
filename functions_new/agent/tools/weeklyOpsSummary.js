/**
 * Tool: resumen operativo semanal (últimos 7 días).
 */
const admin = require("firebase-admin");

function toDate(value) {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === "function")
    return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const schema = {
  type: "function",
  function: {
    name: "weeklyOpsSummary",
    description:
      "Genera un resumen operativo de los últimos 7 días (incidencias, trabajos y revisiones).",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

async function run(companyId) {
  if (!companyId) return "Falta companyId.";
  const db = admin.firestore();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [incidentsSnap, jobsSnap, checklistsSnap] = await Promise.all([
    db.collection("incidents").where("companyId", "==", companyId).get(),
    db.collection("jobs").where("companyId", "==", companyId).get(),
    db.collection("checklists").where("companyId", "==", companyId).get(),
  ]);

  const incidents = incidentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const checklists = checklistsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const incidentsCreatedWeek = incidents.filter((i) => {
    const c = toDate(i.createdAt || i.date);
    return c && c >= sevenDaysAgo;
  });
  const incidentsClosedWeek = incidents.filter((i) => {
    if (!i.done) return false;
    const c = toDate(i.closedAt || i.stateUpdatedAt || i.updatedAt);
    return c && c >= sevenDaysAgo;
  });
  const incidentsOpenNow = incidents.filter((i) => !i.done).length;

  const jobsCreatedWeek = jobs.filter((j) => {
    const c = toDate(j.createdAt || j.date);
    return c && c >= sevenDaysAgo;
  });
  const jobsDoneWeek = jobs.filter((j) => {
    if (!(j.done || j.status === "done")) return false;
    const c = toDate(j.updatedAt || j.date);
    return c && c >= sevenDaysAgo;
  });
  const jobsPendingNow = jobs.filter(
    (j) => !(j.done || j.status === "done" || j.status === "cancelled"),
  ).length;

  const checklistsCreatedWeek = checklists.filter((c) => {
    const d = toDate(c.createdAt || c.date);
    return d && d >= sevenDaysAgo;
  });
  const checklistsFinishedWeek = checklists.filter((c) => {
    if (!c.finished) return false;
    const d = toDate(c.updatedAt || c.date);
    return d && d >= sevenDaysAgo;
  });
  const checklistsOpenNow = checklists.filter((c) => !c.finished).length;

  return [
    "Resumen semanal (últimos 7 días):",
    `• Incidencias creadas: ${incidentsCreatedWeek.length}`,
    `• Incidencias cerradas: ${incidentsClosedWeek.length}`,
    `• Incidencias abiertas ahora: ${incidentsOpenNow}`,
    `• Trabajos creados: ${jobsCreatedWeek.length}`,
    `• Trabajos finalizados: ${jobsDoneWeek.length}`,
    `• Trabajos pendientes ahora: ${jobsPendingNow}`,
    `• Revisiones creadas: ${checklistsCreatedWeek.length}`,
    `• Revisiones finalizadas: ${checklistsFinishedWeek.length}`,
    `• Revisiones abiertas ahora: ${checklistsOpenNow}`,
  ].join("\n");
}

module.exports = { schema, run };
