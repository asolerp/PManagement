/**
 * Tool: actualiza progreso de checklist.
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "updateChecklistProgress",
    description:
      "Actualiza progreso de checklist: done/total, estado finalizado y comentario opcional.",
    parameters: {
      type: "object",
      properties: {
        checklistId: {
          type: "string",
          description: "ID del checklist.",
        },
        done: {
          type: "number",
          description: "Puntos completados.",
        },
        total: {
          type: "number",
          description: "Puntos totales.",
        },
        incrementDoneBy: {
          type: "number",
          description: "Incremento de puntos completados.",
        },
        finished: {
          type: "boolean",
          description: "Marcar checklist como finalizado (true/false).",
        },
        commentText: {
          type: "string",
          description: "Comentario para el historial del checklist.",
        },
      },
      required: ["checklistId"],
    },
  },
};

async function run(companyId, args) {
  const { checklistId, done, total, incrementDoneBy, finished, commentText } =
    args || {};
  if (!companyId || !checklistId) return "Faltan checklistId o companyId.";
  const db = admin.firestore();
  const ref = db.collection("checklists").doc(String(checklistId).trim());
  const snap = await ref.get();
  if (!snap.exists) return `No existe el checklist "${checklistId}".`;
  const data = snap.data() || {};
  if (data.companyId !== companyId)
    return "Ese checklist no pertenece a tu empresa.";

  const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  const currentDone = Number(data.done || 0);
  const currentTotal = Number(data.total || 0);
  if (Number.isFinite(Number(done))) updates.done = Math.max(0, Number(done));
  if (Number.isFinite(Number(total)))
    updates.total = Math.max(0, Number(total));
  if (Number.isFinite(Number(incrementDoneBy))) {
    updates.done = Math.max(
      0,
      (Number.isFinite(Number(updates.done))
        ? Number(updates.done)
        : currentDone) + Number(incrementDoneBy),
    );
  }
  if (typeof finished === "boolean") updates.finished = finished;
  if (updates.done != null && updates.total != null) {
    if (
      updates.done >= updates.total &&
      updates.total > 0 &&
      updates.finished == null
    ) {
      updates.finished = true;
    }
  }

  await ref.update(updates);
  await ref.collection("activity").add({
    type: "checklist_progress_update",
    before: {
      done: currentDone,
      total: currentTotal,
      finished: Boolean(data.finished),
    },
    after: {
      done: updates.done != null ? updates.done : currentDone,
      total: updates.total != null ? updates.total : currentTotal,
      finished:
        updates.finished != null ? updates.finished : Boolean(data.finished),
    },
    user: { source: "telegram" },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  if (String(commentText || "").trim()) {
    await ref.collection("messages").add({
      text: String(commentText).trim(),
      user: { source: "telegram" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  return `Checklist "${checklistId}" actualizado correctamente.`;
}

module.exports = { schema, run };
