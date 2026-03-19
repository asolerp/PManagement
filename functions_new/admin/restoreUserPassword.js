const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");

/**
 * Genera enlace de restablecimiento de contraseña.
 * Envío por email desactivado; se devuelve el link en la respuesta para que el dashboard lo muestre.
 */
exports.sendPasswordResetEmail = onCall({ region: REGION }, async (request) => {
  const email = request.data?.email;

  if (!email) {
    throw new HttpsError("invalid-argument", "email is required.");
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    return { success: true, resetLink };
  } catch (error) {
    throw new HttpsError(
      "internal",
      "Error al generar el enlace de restablecimiento de contraseña.",
      error?.message,
    );
  }
});
