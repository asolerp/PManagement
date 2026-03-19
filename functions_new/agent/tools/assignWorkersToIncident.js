/**
 * Tool: asigna trabajadores a una incidencia existente.
 * Permite reemplazar toda la asignación o añadir sin reemplazar.
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "assignWorkersToIncident",
    description:
      "Asigna trabajadores a una incidencia por IDs de usuario. Puedes reemplazar toda la asignación o añadir a los ya asignados.",
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "ID del documento de la incidencia en Firestore.",
        },
        workerIds: {
          type: "array",
          items: { type: "string" },
          description: "Lista de IDs de usuarios/trabajadores a asignar.",
        },
        replace: {
          type: "boolean",
          description:
            "Si true, reemplaza completamente workersId. Si false, añade sin borrar existentes. Por defecto true.",
        },
      },
      required: ["incidentId", "workerIds"],
    },
  },
};

function dedupeIds(ids) {
  return [
    ...new Set(
      (ids || []).map((id) => String(id || "").trim()).filter(Boolean),
    ),
  ];
}

async function loadWorkersByIds(db, companyId, workerIds) {
  const users = [];
  const missingIds = [];
  const foreignIds = [];

  for (const uid of workerIds) {
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) {
      missingIds.push(uid);
      continue;
    }
    const data = snap.data() || {};
    if (data.companyId !== companyId) {
      foreignIds.push(uid);
      continue;
    }
    users.push({
      id: snap.id,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      role: data.role || null,
    });
  }

  return { users, missingIds, foreignIds };
}

async function run(companyId, args) {
  const { incidentId, workerIds, replace = true } = args || {};
  if (!companyId || !incidentId) return "Faltan incidentId o companyId.";
  if (!Array.isArray(workerIds) || workerIds.length === 0) {
    return "Debes enviar workerIds con al menos un ID de usuario.";
  }

  const db = admin.firestore();
  const ref = db.collection("incidents").doc(String(incidentId).trim());
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ninguna incidencia con ID "${incidentId}".`;
  }
  const data = snap.data() || {};
  if (data.companyId !== companyId) {
    return "Esa incidencia no pertenece a tu empresa.";
  }

  const cleanWorkerIds = dedupeIds(workerIds);
  const { users, missingIds, foreignIds } = await loadWorkersByIds(
    db,
    companyId,
    cleanWorkerIds,
  );

  if (users.length === 0) {
    return "No se han encontrado trabajadores válidos para asignar en tu empresa.";
  }

  const currentIds = dedupeIds(data.workersId || []);
  const mergedIds = replace
    ? users.map((u) => u.id)
    : dedupeIds([...currentIds, ...users.map((u) => u.id)]);

  const mergedWorkers = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
  }));

  const batch = db.batch();
  batch.update(ref, {
    workersId: mergedIds,
    workers: mergedWorkers,
    stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const activityRef = ref.collection("activity").doc();
  batch.set(activityRef, {
    type: "assignment_change",
    fromWorkersId: currentIds,
    toWorkersId: mergedIds,
    replace: Boolean(replace),
    user: { source: "telegram" },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();

  const names = mergedWorkers.map((w) => {
    const label = [w.firstName, w.lastName].filter(Boolean).join(" ").trim();
    return label || w.email || w.id;
  });

  const notes = [];
  if (missingIds.length) {
    notes.push(`IDs inexistentes: ${missingIds.join(", ")}.`);
  }
  if (foreignIds.length) {
    notes.push(`IDs fuera de tu empresa: ${foreignIds.join(", ")}.`);
  }

  return [
    `Asignación actualizada en incidencia ${snap.id}.`,
    `Trabajadores asignados (${mergedIds.length}): ${names.join(", ")}.`,
    notes.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

module.exports = { schema, run };
