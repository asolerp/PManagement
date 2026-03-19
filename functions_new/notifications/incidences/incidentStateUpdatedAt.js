const admin = require("firebase-admin");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { REGION } = require("../../utils");

/**
 * Al actualizar un documento en incidents: si cambian state o done y no viene
 * stateUpdatedAt en el payload, lo rellena con serverTimestamp().
 * Así clientes legacy o rutas que no envíen el campo quedan cubiertos.
 */
const incidentStateUpdatedAt = onDocumentUpdated(
  { document: "incidents/{incidenceId}", region: REGION },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const ref = event.data.after.ref;

    const stateOrDoneChanged =
      before.state !== after.state || before.done !== after.done;
    const missingStateUpdatedAt =
      after.stateUpdatedAt === undefined || after.stateUpdatedAt === null;

    if (stateOrDoneChanged && missingStateUpdatedAt) {
      try {
        await ref.update({
          stateUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("incidentStateUpdatedAt", err);
      }
    }
  },
);

module.exports = { incidentStateUpdatedAt };
