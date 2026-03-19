/**
 * Tool: lista los checklists no finalizados (revisiones en curso).
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "listOpenChecklists",
    description:
      "Lista los checklists (revisiones) que aún no están finalizados: id, propiedad, fecha, progreso. Útil para 'revisiones pendientes', 'checklists abiertos', 'qué revisiones hay en curso'.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Máximo número de checklists a devolver (por defecto 20)",
        },
      },
      required: [],
    },
  },
};

async function run(companyId, args) {
  if (!companyId) return "Falta companyId.";
  const limit = Math.min(Number(args?.limit) || 20, 50);
  const db = admin.firestore();
  const snap = await db
    .collection("checklists")
    .where("companyId", "==", companyId)
    .where("finished", "==", false)
    .orderBy("date", "desc")
    .limit(limit)
    .get();
  const list = snap.docs.map((d) => {
    const data = d.data();
    const houseName =
      data.house?.[0]?.houseName ||
      data.house?.houseName ||
      data.houseId ||
      "?";
    const dateStr = data.date?.toDate
      ? data.date.toDate().toISOString().slice(0, 10)
      : data.date?.seconds
        ? new Date(data.date.seconds * 1000).toISOString().slice(0, 10)
        : "—";
    const progress = `${data.done ?? 0}/${data.total ?? 0}`;
    return `- [${d.id}] ${houseName} | ${dateStr} | ${progress}`;
  });
  if (list.length === 0) {
    return "No hay checklists abiertos (todas las revisiones están finalizadas).";
  }
  return `Checklists abiertos (${list.length}):\n${list.join("\n")}`;
}

module.exports = { schema, run };
