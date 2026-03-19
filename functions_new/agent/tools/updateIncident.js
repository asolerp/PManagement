/**
 * Tool: actualiza el estado de una incidencia y/o añade un comentario al historial (timeline).
 * El historial combina la subcolección activity (cambios de estado) y messages (comentarios).
 */
const admin = require("firebase-admin");

const VALID_STATES = [
  "iniciada",
  "asignada",
  "process",
  "proceso",
  "en_espera",
  "espera",
  "done",
  "finalizada",
  "cancelada",
];

function normalizeState(value) {
  if (!value || typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "finalizada" || v === "cerrada") return "done";
  if (v === "proceso") return "process";
  if (v === "espera") return "en_espera";
  if (VALID_STATES.includes(v)) return v;
  return null;
}

const schema = {
  type: "function",
  function: {
    name: "updateIncident",
    description:
      "Actualiza una incidencia existente: cambia su estado y/o añade un comentario al historial. Estados válidos: iniciada, asignada, process (en proceso), en_espera, done (finalizada), cancelada. Si solo quieres añadir un comentario, no pongas newState; si solo quieres cambiar estado, no pongas commentText.",
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "ID del documento de la incidencia en Firestore",
        },
        newState: {
          type: "string",
          description:
            "Nuevo estado: iniciada, asignada, process, en_espera, done, cancelada. Opcional si solo añades comentario.",
        },
        commentText: {
          type: "string",
          description:
            "Texto del comentario a añadir al historial de la incidencia. Opcional si solo cambias estado.",
        },
      },
      required: ["incidentId"],
    },
  },
};

async function run(companyId, args) {
  const { incidentId, newState, commentText } = args || {};
  if (!companyId || !incidentId || typeof incidentId !== "string") {
    return "Faltan incidentId o companyId.";
  }
  const id = incidentId.trim();
  if (!id) return "El incidentId no puede estar vacío.";

  const db = admin.firestore();
  const ref = db.collection("incidents").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ninguna incidencia con ID "${id}". Usa getOpenIncidents para listar incidencias.`;
  }
  const data = snap.data();
  if (data.companyId !== companyId) {
    return "Esa incidencia no pertenece a tu empresa.";
  }

  const stateToSet = normalizeState(newState);
  if (newState != null && newState !== "" && !stateToSet) {
    return `Estado "${newState}" no válido. Usa uno de: iniciada, asignada, process, en_espera, done, cancelada.`;
  }

  const updates = [];
  const batch = db.batch();

  if (stateToSet) {
    const fromState = data.state || "iniciada";
    const fromDone = Boolean(data.done);
    const toDone = stateToSet === "done" || stateToSet === "cancelada";
    if (fromState !== stateToSet || fromDone !== toDone) {
      batch.update(ref, {
        state: stateToSet,
        done: toDone,
        stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const activityRef = db
        .collection("incidents")
        .doc(id)
        .collection("activity")
        .doc();
      batch.set(activityRef, {
        type: "state_change",
        fromState,
        toState: stateToSet,
        fromDone,
        toDone,
        user: { source: "telegram" },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updates.push(
        `Estado actualizado: ${fromState} → ${stateToSet}${toDone ? " (cerrada)" : ""}.`,
      );
    }
  }

  const comment = typeof commentText === "string" ? commentText.trim() : "";
  if (comment) {
    const messageRef = db
      .collection("incidents")
      .doc(id)
      .collection("messages")
      .doc();
    batch.set(messageRef, {
      text: comment,
      user: { source: "telegram" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    updates.push(`Comentario añadido al historial.`);
  }

  if (updates.length === 0) {
    return "Indica newState y/o commentText para actualizar la incidencia. No se ha cambiado nada.";
  }

  await batch.commit();
  const title = data.title || "(sin título)";
  return `Incidencia "${title}" (${id}): ${updates.join(" ")}`;
}

module.exports = { schema, run };
