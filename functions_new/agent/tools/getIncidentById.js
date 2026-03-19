/**
 * Tool: obtiene el detalle de una incidencia por ID (solo si pertenece a la empresa).
 */
const admin = require("firebase-admin");
const { formatTime } = require("./formatTime");

const schema = {
  type: "function",
  function: {
    name: "getIncidentById",
    description:
      "Obtiene el detalle completo de una incidencia por su ID: título, propiedad, estado, descripción, fechas, asignado.",
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "ID del documento de la incidencia en Firestore",
        },
      },
      required: ["incidentId"],
    },
  },
};

async function run(companyId, args) {
  const { incidentId } = args || {};
  if (!incidentId || !companyId) {
    return "Faltan incidentId o companyId.";
  }
  const db = admin.firestore();
  const ref = db.collection("incidents").doc(incidentId);
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ninguna incidencia con ID "${incidentId}".`;
  }
  const data = snap.data();
  if (data.companyId !== companyId) {
    return "Esa incidencia no pertenece a tu empresa.";
  }
  let propertyName = "Sin propiedad";
  if (data.houseId) {
    const houseSnap = await db.collection("properties").doc(data.houseId).get();
    propertyName = houseSnap.exists
      ? houseSnap.data().houseName || houseSnap.data().address || data.houseId
      : data.houseId;
  }
  const lines = [
    `ID: ${snap.id}`,
    `Título: ${data.title || "(sin título)"}`,
    `Propiedad: ${propertyName}`,
    `Estado: ${data.state || "—"}`,
    `Cerrada: ${data.done ? "Sí" : "No"}`,
    `Descripción: ${(data.incidence || data.description || "").slice(0, 300) || "—"}`,
  ];
  if (data.createdAt) {
    lines.push(
      `Creada: ${data.createdAt.toDate ? data.createdAt.toDate().toISOString().slice(0, 16) : "—"}`,
    );
  }
  if (data.assignedWorker) {
    const w = data.assignedWorker;
    lines.push(
      `Asignado: ${[w.firstName, w.lastName].filter(Boolean).join(" ") || w.email || "—"}`,
    );
  }
  return lines.join("\n");
}

module.exports = { schema, run };
