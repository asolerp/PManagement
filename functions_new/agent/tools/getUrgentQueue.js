/**
 * Tool: cola unificada de urgencias.
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

function ymd(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : null;
}

const schema = {
  type: "function",
  function: {
    name: "getUrgentQueue",
    description:
      "Devuelve una cola de urgencias combinando incidencias por vencer/vencidas y trabajos atrasados.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Máximo de elementos en la cola (por defecto 12, máximo 30).",
        },
        dueInHours: {
          type: "number",
          description:
            "Ventana de vencimiento cercano para incidencias (por defecto 24h).",
        },
      },
      required: [],
    },
  },
};

async function run(companyId, args) {
  if (!companyId) return "Falta companyId.";
  const limit = Math.min(Math.max(1, Number(args?.limit) || 12), 30);
  const dueInHours = Math.max(1, Number(args?.dueInHours) || 24);

  const db = admin.firestore();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const dueThreshold = new Date(now.getTime() + dueInHours * 60 * 60 * 1000);
  const [incidentsSnap, jobsSnap] = await Promise.all([
    db.collection("incidents").where("companyId", "==", companyId).get(),
    db.collection("jobs").where("companyId", "==", companyId).get(),
  ]);

  const queue = [];

  incidentsSnap.docs.forEach((d) => {
    const i = d.data() || {};
    if (i.done) return;
    const due = toDate(i.responseDueAt || i.resolutionDueAt);
    if (!due) return;
    if (due < now) {
      queue.push({
        kind: "incidencia",
        severity: 3,
        when: due,
        text: `Incidencia vencida: ${i.title || "(sin título)"} (estado: ${i.state || "—"}, vencía: ${due.toISOString().slice(0, 16).replace("T", " ")}).`,
      });
      return;
    }
    if (due <= dueThreshold) {
      queue.push({
        kind: "incidencia",
        severity: 2,
        when: due,
        text: `Incidencia por vencer: ${i.title || "(sin título)"} (estado: ${i.state || "—"}, vence: ${due.toISOString().slice(0, 16).replace("T", " ")}).`,
      });
    }
  });

  jobsSnap.docs.forEach((d) => {
    const j = d.data() || {};
    const jd = ymd(j.date);
    const done =
      Boolean(j.done) || j.status === "done" || j.status === "cancelled";
    if (!jd || done) return;
    if (jd < date) {
      queue.push({
        kind: "trabajo",
        severity: 2,
        when: toDate(j.date) || new Date(`${jd}T00:00:00Z`),
        text: `Trabajo atrasado: ${j.title || j.jobName || "(sin título)"} (fecha: ${jd}, estado: ${j.status || "pending"}).`,
      });
    }
  });

  queue.sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity;
    return (a.when?.getTime?.() || 0) - (b.when?.getTime?.() || 0);
  });
  if (!queue.length) {
    return "No hay urgencias en este momento.";
  }
  const lines = queue.slice(0, limit).map((x, i) => `${i + 1}. ${x.text}`);
  return `Cola de urgencias (${Math.min(limit, queue.length)} de ${queue.length}):\n${lines.join("\n")}`;
}

module.exports = { schema, run };
