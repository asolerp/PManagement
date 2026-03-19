/**
 * Tool: lista las propiedades (casas) de la empresa.
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "listProperties",
    description:
      "Lista las propiedades (casas) de la empresa: id, nombre, dirección. Útil para 'cuántas casas hay', 'lista de propiedades', 'qué casas tenemos'.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Máximo número de propiedades a devolver (por defecto 30)",
        },
      },
      required: [],
    },
  },
};

async function run(companyId, args) {
  if (!companyId) return "Falta companyId.";
  const limit = Math.min(Number(args?.limit) || 30, 100);
  const db = admin.firestore();
  const snap = await db
    .collection("properties")
    .where("companyId", "==", companyId)
    .limit(limit)
    .get();
  const list = snap.docs.map((d) => {
    const data = d.data();
    const name = data.houseName || data.address || "(sin nombre)";
    const addr = data.address || data.street || "—";
    return `- [${d.id}] ${name} | ${addr}`;
  });
  if (list.length === 0) {
    return "No hay propiedades en la empresa.";
  }
  return `Propiedades (${list.length}):\n${list.join("\n")}`;
}

module.exports = { schema, run };
