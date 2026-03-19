/**
 * Obtiene un resumen de datos de la empresa para inyectar como contexto al LLM.
 * Solo lectura; todo filtrado por companyId.
 */

const admin = require("firebase-admin");

function formatTime(val) {
  if (!val) return "—";
  const d = val?.toDate ? val.toDate() : new Date(val.seconds * 1000);
  return d.toTimeString().slice(0, 5);
}

/**
 * Genera contexto en texto para el prompt del agente.
 * @param {string} companyId
 * @param {string} [dateStr] - Fecha en yyyy-MM-dd (por defecto hoy)
 * @returns {Promise<string>}
 */
async function getCompanyContext(companyId, dateStr) {
  if (!companyId) return "Sin empresa asignada.";
  const db = admin.firestore();

  const date = dateStr || new Date().toISOString().slice(0, 10);
  const parts = [];

  // Quadrant del día
  const quadrantsSnap = await db
    .collection("quadrants")
    .where("companyId", "==", companyId)
    .where("date", "==", date)
    .get();
  const quadrants = quadrantsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (quadrants.length > 0) {
    const q = quadrants[0];
    const jobsSnap = await db
      .collection("quadrants")
      .doc(q.id)
      .collection("jobs")
      .get();
    const jobs = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    jobs.sort((a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0));
    const byWorker = new Map();
    for (const j of jobs) {
      const wid = j.worker?.id ?? j.workersId?.[0] ?? "_";
      if (!byWorker.has(wid)) byWorker.set(wid, []);
      byWorker.get(wid).push(j);
    }
    const workerLines = [];
    for (const [wid, workerJobs] of byWorker) {
      const name =
        workerJobs[0]?.worker?.firstName || workerJobs[0]?.worker?.lastName
          ? [workerJobs[0].worker.firstName, workerJobs[0].worker.lastName]
              .filter(Boolean)
              .join(" ")
          : wid;
      const slots = workerJobs
        .map((j) => {
          const houseName = j.house?.houseName || j.houseId || "?";
          return `${houseName} (${formatTime(j.startHour)}–${formatTime(j.endHour)})`;
        })
        .join(", ");
      workerLines.push(`- ${name}: ${slots}`);
    }
    parts.push(`Cuadrante del día ${date}:\n${workerLines.join("\n")}`);
  } else {
    parts.push(`Cuadrante del día ${date}: No hay cuadrante para esta fecha.`);
  }

  // Incidencias abiertas: resolver nombre de propiedad y incluir estado
  const incSnap = await db
    .collection("incidents")
    .where("companyId", "==", companyId)
    .get();
  const allIncidents = incSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const openIncidents = allIncidents.filter((i) => !i.done);
  const houseIds = [
    ...new Set(allIncidents.map((i) => i.houseId).filter(Boolean)),
  ];
  const houseNames = {};
  for (const hid of houseIds) {
    const h = await db.collection("properties").doc(hid).get();
    houseNames[hid] = h.exists
      ? h.data().houseName || h.data().address || hid
      : hid;
  }
  const incidentLines = openIncidents.slice(0, 25).map((i) => {
    const prop = i.houseId
      ? houseNames[i.houseId] || i.houseId
      : "Sin propiedad";
    const state = i.state || "—";
    const title = i.title || "(sin título)";
    const desc = (i.incidence || i.description || "").slice(0, 80);
    return `- [${i.id}] "${title}" | Propiedad: ${prop} | Estado: ${state}${desc ? ` | ${desc}` : ""}`;
  });
  parts.push(
    `Incidencias abiertas (${openIncidents.length}):\n${incidentLines.length ? incidentLines.join("\n") : "Ninguna."}`,
  );
  const closedCount = allIncidents.filter((i) => i.done).length;
  if (closedCount > 0)
    parts.push(`Incidencias cerradas (total): ${closedCount}.`);

  // Jobs del día: detalle (casa, trabajador, franja)
  const jobsColSnap = await db
    .collection("jobs")
    .where("companyId", "==", companyId)
    .get();
  const todayJobs = jobsColSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((j) => {
      const jDate = j.date?.toDate
        ? j.date.toDate().toISOString().slice(0, 10)
        : j.date && j.date.seconds
          ? new Date(j.date.seconds * 1000).toISOString().slice(0, 10)
          : null;
      return jDate === date;
    });
  if (todayJobs.length > 0) {
    const jobHouseIds = [
      ...new Set(todayJobs.map((j) => j.houseId).filter(Boolean)),
    ];
    const jobHouseNames = {};
    for (const hid of jobHouseIds) {
      const h = await db.collection("properties").doc(hid).get();
      jobHouseNames[hid] = h.exists
        ? h.data().houseName || h.data().address || hid
        : hid;
    }
    const jobLines = todayJobs.map((j) => {
      const houseName = j.houseId
        ? jobHouseNames[j.houseId] || j.house?.houseName
        : j.house?.houseName || "?";
      const workerName = j.workers?.[0]
        ? [j.workers[0].firstName, j.workers[0].lastName]
            .filter(Boolean)
            .join(" ") || j.workers[0].email
        : "Sin asignar";
      const start = formatTime(j.quadrantStartHour ?? j.startHour);
      const end = formatTime(j.quadrantEndHour ?? j.endHour);
      return `- ${houseName} | ${workerName} | ${start}–${end}`;
    });
    parts.push(
      `Trabajos del día (${todayJobs.length}):\n${jobLines.join("\n")}`,
    );
  } else {
    parts.push("Trabajos del día: ninguno.");
  }

  return parts.join("\n\n");
}

module.exports = {
  getCompanyContext,
};
