/**
 * Tool: crea una incidencia en la empresa.
 * Acepta propiedad por ID o por nombre; si hay varias coincidencias por nombre, pide confirmar (número o ID).
 */
const admin = require("firebase-admin");

const DEFAULT_RESPONSE_H = 24;
const DEFAULT_RESOLUTION_H = 72;
const MAX_PROPERTIES_SEARCH = 100;

const schema = {
  type: "function",
  function: {
    name: "createIncidence",
    description:
      "Crea una nueva incidencia en una propiedad. Título obligatorio. Propiedad: por nombre (propertyName) o por ID (propertyId). Si buscas por nombre y hay varias coincidencias, se devuelve lista numerada para que el usuario confirme con el número o el ID; entonces llama de nuevo createIncidence con ese propertyId.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Título breve de la incidencia (ej: Fuga de agua en baño)",
        },
        description: {
          type: "string",
          description: "Descripción o detalles adicionales (opcional)",
        },
        propertyId: {
          type: "string",
          description:
            "ID de la propiedad (houseId). Usar cuando el usuario ya confirmó o dio el ID.",
        },
        propertyName: {
          type: "string",
          description:
            "Nombre o parte del nombre de la propiedad para buscar (ej: Bendinat, Casa 2). Si hay una sola coincidencia se crea; si hay varias se devuelve lista para confirmar.",
        },
        photoUrls: {
          type: "array",
          items: { type: "string" },
          description: "URLs de fotos ya subidas a Storage (opcional).",
        },
      },
      required: ["title"],
    },
  },
};

async function findPropertyByCompanyAndName(db, companyId, propertyName) {
  const snap = await db
    .collection("properties")
    .where("companyId", "==", companyId)
    .limit(MAX_PROPERTIES_SEARCH)
    .get();
  const search = propertyName.trim().toLowerCase();
  const matches = snap.docs.filter((d) => {
    const data = d.data();
    const name = (data.houseName || "").toLowerCase();
    const address = (data.address || data.street || "").toLowerCase();
    return name.includes(search) || address.includes(search);
  });
  return matches.map((d) => ({ id: d.id, ...d.data() }));
}

async function run(companyId, args) {
  const { title, description, propertyId, propertyName, photoUrls } =
    args || {};
  if (!companyId) return "Falta companyId.";
  if (!title || typeof title !== "string" || !title.trim()) {
    return "El título es obligatorio.";
  }
  const db = admin.firestore();

  let propData = null;
  let resolvedId = null;

  const hasId =
    propertyId && typeof propertyId === "string" && propertyId.trim();
  const hasName =
    propertyName && typeof propertyName === "string" && propertyName.trim();

  if (hasId) {
    const propRef = db.collection("properties").doc(propertyId.trim());
    const propSnap = await propRef.get();
    if (!propSnap.exists) {
      return `No existe ninguna propiedad con ID "${propertyId}". Puedes buscar por nombre con propertyName o usar listProperties.`;
    }
    const data = propSnap.data();
    if (data.companyId !== companyId) {
      return "Esa propiedad no pertenece a tu empresa. No se puede crear la incidencia.";
    }
    propData = data;
    resolvedId = propSnap.id;
  } else if (hasName) {
    const matches = await findPropertyByCompanyAndName(
      db,
      companyId,
      propertyName.trim(),
    );
    if (matches.length === 0) {
      return `No hay ninguna propiedad que coincida con "${propertyName.trim()}". Usa listProperties para ver la lista de propiedades.`;
    }
    if (matches.length > 1) {
      const lines = matches.map((p, i) => {
        const name = p.houseName || p.address || p.id;
        return `${i + 1}) ${p.id} — ${name}`;
      });
      return `Varias propiedades coinciden con "${propertyName.trim()}". Indica el número (1, 2, …) o el ID para confirmar:\n${lines.join("\n")}\n\nEjemplo: responde "1" o "la primera" para crear la incidencia en la propiedad 1.`;
    }
    propData = matches[0];
    resolvedId = matches[0].id;
  } else {
    return 'Indica la propiedad por nombre (propertyName) o por ID (propertyId). Ejemplo: "Crea incidencia: fuga de agua en Casa Bendinat".';
  }

  const now = new Date();
  const responseDueAt = new Date(
    now.getTime() + DEFAULT_RESPONSE_H * 60 * 60 * 1000,
  );
  const resolutionDueAt = new Date(
    now.getTime() + DEFAULT_RESOLUTION_H * 60 * 60 * 1000,
  );

  const houseDisplay = {
    houseName: propData.houseName || propData.address || resolvedId,
    address: propData.address || propData.street || null,
  };

  const photos =
    Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : [];
  const docRef = await db.collection("incidents").add({
    companyId,
    title: title.trim(),
    incidence: (description && String(description).trim()) || null,
    description: (description && String(description).trim()) || null,
    houseId: resolvedId,
    house: houseDisplay,
    state: "iniciada",
    date: admin.firestore.Timestamp.fromDate(now),
    done: false,
    workersId: [],
    photos,
    responseDueAt: admin.firestore.Timestamp.fromDate(responseDueAt),
    resolutionDueAt: admin.firestore.Timestamp.fromDate(resolutionDueAt),
    createdBy: null,
    stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const propName = propData.houseName || propData.address || resolvedId;
  return `Incidencia creada correctamente.\nID: ${docRef.id}\nTítulo: ${title.trim()}\nPropiedad: ${propName}\nEstado: iniciada.`;
}

module.exports = { schema, run };
