/**
 * Tool: obtiene el detalle de una propiedad/casa por ID (solo si pertenece a la empresa).
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "getPropertyById",
    description:
      "Obtiene el detalle de una propiedad (casa) por su ID: nombre, dirección, ubicación, propietario si existe.",
    parameters: {
      type: "object",
      properties: {
        propertyId: {
          type: "string",
          description: "ID del documento de la propiedad en Firestore",
        },
      },
      required: ["propertyId"],
    },
  },
};

async function run(companyId, args) {
  const { propertyId } = args || {};
  if (!propertyId || !companyId) {
    return "Faltan propertyId o companyId.";
  }
  const db = admin.firestore();
  const ref = db.collection("properties").doc(propertyId);
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ninguna propiedad con ID "${propertyId}".`;
  }
  const data = snap.data();
  if (data.companyId !== companyId) {
    return "Esa propiedad no pertenece a tu empresa.";
  }
  const lines = [
    `ID: ${snap.id}`,
    `Nombre: ${data.houseName || "—"}`,
    `Dirección: ${data.address || data.street || "—"}`,
  ];
  if (data.location) {
    const loc = data.location;
    if (loc.latitude != null && loc.longitude != null) {
      lines.push(`Ubicación: ${loc.latitude}, ${loc.longitude}`);
    }
  }
  if (data.owner?.firstName || data.owner?.lastName || data.owner?.email) {
    const o = data.owner;
    lines.push(
      `Propietario: ${[o.firstName, o.lastName].filter(Boolean).join(" ") || o.email || "—"}`,
    );
  }
  return lines.join("\n");
}

module.exports = { schema, run };
