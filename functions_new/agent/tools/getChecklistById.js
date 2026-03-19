/**
 * Tool: obtiene el detalle de un checklist por ID (solo si pertenece a la empresa).
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "getChecklistById",
    description:
      "Obtiene el detalle de un checklist (revisión) por su ID: propiedad, fecha, estado (finalizado o no), trabajadores asignados, progreso de checks.",
    parameters: {
      type: "object",
      properties: {
        checklistId: {
          type: "string",
          description: "ID del documento del checklist en Firestore",
        },
      },
      required: ["checklistId"],
    },
  },
};

async function run(companyId, args) {
  const { checklistId } = args || {};
  if (!checklistId || !companyId) {
    return "Faltan checklistId o companyId.";
  }
  const db = admin.firestore();
  const ref = db.collection("checklists").doc(checklistId);
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ningún checklist con ID "${checklistId}".`;
  }
  const data = snap.data();
  if (data.companyId !== companyId) {
    return "Ese checklist no pertenece a tu empresa.";
  }
  const houseName =
    data.house?.[0]?.houseName || data.house?.houseName || data.houseId || "—";
  const dateStr = data.date?.toDate
    ? data.date.toDate().toISOString().slice(0, 10)
    : data.date?.seconds
      ? new Date(data.date.seconds * 1000).toISOString().slice(0, 10)
      : "—";
  const lines = [
    `ID: ${snap.id}`,
    `Propiedad: ${houseName}`,
    `Fecha: ${dateStr}`,
    `Finalizado: ${data.finished ? "Sí" : "No"}`,
    `Progreso: ${data.done ?? 0} / ${data.total ?? 0} puntos`,
  ];
  if (data.observations) {
    lines.push(`Observaciones: ${String(data.observations).slice(0, 200)}`);
  }
  if (data.workersId?.length) {
    const workers = await Promise.all(
      data.workersId
        .slice(0, 5)
        .map((uid) => db.collection("users").doc(uid).get()),
    );
    const names = workers
      .filter((w) => w.exists)
      .map((w) => {
        const d = w.data();
        return [d.firstName, d.lastName].filter(Boolean).join(" ") || d.email;
      });
    lines.push(`Asignados: ${names.join(", ") || "—"}`);
  }
  return lines.join("\n");
}

module.exports = { schema, run };
