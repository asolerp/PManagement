/**
 * Tool: actualiza un trabajo existente (estado y/u observaciones).
 */
const admin = require("firebase-admin");

const VALID_STATUS = ["pending", "in_progress", "done", "cancelled"];

function normalizeStatus(status) {
  if (!status || typeof status !== "string") return null;
  const value = status.trim().toLowerCase();
  if (value === "en_curso" || value === "proceso") return "in_progress";
  if (value === "finalizado" || value === "completado") return "done";
  if (value === "cancelado") return "cancelled";
  return VALID_STATUS.includes(value) ? value : null;
}

const schema = {
  type: "function",
  function: {
    name: "updateJob",
    description:
      "Actualiza un trabajo por ID: permite cambiar estado (pending, in_progress, done, cancelled) y/o observaciones.",
    parameters: {
      type: "object",
      properties: {
        jobId: {
          type: "string",
          description: "ID del documento del trabajo en Firestore.",
        },
        newStatus: {
          type: "string",
          description:
            "Nuevo estado: pending, in_progress, done, cancelled. También acepta finalizado/completado/cancelado/en_curso.",
        },
        observations: {
          type: "string",
          description:
            "Observaciones del trabajo. Si se envía vacío, se limpia el campo.",
        },
      },
      required: ["jobId"],
    },
  },
};

async function run(companyId, args) {
  const { jobId, newStatus, observations } = args || {};
  if (!companyId || !jobId) return "Faltan jobId o companyId.";

  const db = admin.firestore();
  const ref = db.collection("jobs").doc(String(jobId).trim());
  const snap = await ref.get();
  if (!snap.exists) {
    return `No existe ningún trabajo con ID "${jobId}".`;
  }
  const data = snap.data() || {};
  if (data.companyId !== companyId) {
    return "Ese trabajo no pertenece a tu empresa.";
  }

  const updates = {};
  const messages = [];

  if (newStatus != null && newStatus !== "") {
    const status = normalizeStatus(newStatus);
    if (!status) {
      return `Estado "${newStatus}" no válido. Usa: ${VALID_STATUS.join(", ")}.`;
    }
    const prevStatus = data.status || "pending";
    if (prevStatus !== status) {
      updates.status = status;
      updates.done = status === "done";
      updates.stateUpdatedAt = admin.firestore.FieldValue.serverTimestamp();
      messages.push(`Estado actualizado: ${prevStatus} -> ${status}.`);
    }
  }

  if (observations !== undefined) {
    const obsText = String(observations || "").trim();
    updates.observations = obsText || null;
    messages.push(
      obsText ? "Observaciones actualizadas." : "Observaciones limpiadas.",
    );
  }

  if (Object.keys(updates).length === 0) {
    return "Indica newStatus y/o observations para actualizar el trabajo.";
  }

  const batch = db.batch();
  batch.update(ref, updates);
  const activityRef = ref.collection("activity").doc();
  batch.set(activityRef, {
    type: "job_update",
    updates: {
      status: updates.status || null,
      done: updates.done ?? null,
      observations: Object.prototype.hasOwnProperty.call(
        updates,
        "observations",
      ),
    },
    user: { source: "telegram" },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();

  const jobTitle = data.title || data.jobName || "(sin título)";
  return `Trabajo "${jobTitle}" (${snap.id}): ${messages.join(" ")}`;
}

module.exports = { schema, run };
