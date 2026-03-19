/**
 * Tool: crea un trabajo de seguimiento a partir de una incidencia.
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "createFollowUpTaskFromIncident",
    description:
      "Crea un trabajo (job) relacionado a una incidencia para seguimiento operativo.",
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "ID de la incidencia origen.",
        },
        title: {
          type: "string",
          description:
            "Título del trabajo. Si no se indica, se genera automáticamente.",
        },
        date: {
          type: "string",
          description: "Fecha del trabajo (yyyy-MM-dd). Si no se indica, hoy.",
        },
        workerIds: {
          type: "array",
          items: { type: "string" },
          description: "IDs de trabajadores a asignar (opcional).",
        },
        observations: {
          type: "string",
          description: "Observaciones del trabajo (opcional).",
        },
      },
      required: ["incidentId"],
    },
  },
};

async function run(companyId, args) {
  const { incidentId, title, date, workerIds, observations } = args || {};
  if (!companyId || !incidentId) return "Faltan incidentId o companyId.";
  const taskDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T09:00:00`)
      : new Date();

  const db = admin.firestore();
  const incRef = db.collection("incidents").doc(String(incidentId).trim());
  const incSnap = await incRef.get();
  if (!incSnap.exists) return `No existe la incidencia "${incidentId}".`;
  const inc = incSnap.data() || {};
  if (inc.companyId !== companyId)
    return "Esa incidencia no pertenece a tu empresa.";

  const cleanWorkerIds = Array.isArray(workerIds)
    ? [...new Set(workerIds.map((x) => String(x || "").trim()).filter(Boolean))]
    : [];
  const workers = [];
  for (const wid of cleanWorkerIds) {
    const ws = await db.collection("users").doc(wid).get();
    if (!ws.exists) continue;
    const wd = ws.data() || {};
    if (wd.companyId !== companyId) continue;
    workers.push({
      id: ws.id,
      firstName: wd.firstName || "",
      lastName: wd.lastName || "",
      email: wd.email || "",
      role: wd.role || "worker",
    });
  }

  const jobTitle =
    String(title || "").trim() ||
    `Seguimiento incidencia: ${inc.title || inc.incidence || incidentId}`;
  const jobRef = await db.collection("jobs").add({
    companyId,
    title: jobTitle,
    jobName: jobTitle,
    observations:
      String(observations || "").trim() ||
      `Seguimiento de incidencia ${inc.title || incidentId}.`,
    status: "pending",
    done: false,
    date: admin.firestore.Timestamp.fromDate(taskDate),
    houseId: inc.houseId || null,
    house: inc.house || null,
    workersId: workers.map((w) => w.id),
    workers,
    sourceIncidentId: incSnap.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await incRef.collection("activity").add({
    type: "follow_up_task_created",
    jobId: jobRef.id,
    jobTitle,
    user: { source: "telegram" },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return `Trabajo de seguimiento creado: "${jobTitle}" (ID: ${jobRef.id}).`;
}

module.exports = { schema, run };
