/**
 * Callable: sincroniza los custom claims (companyId, role) del usuario
 * desde su documento en Firestore. Así las reglas de Firestore que usan
 * request.auth.token.companyId funcionan sin tener que ejecutar migraciones a mano.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { setTenantClaims } = require("../lib/tenantAuth");

const syncTenantClaims = onCall({ region: "europe-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes estar autenticado.");
  }
  const uid = request.auth.uid;

  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  if (!userDoc.exists) {
    return { updated: false, reason: "user_doc_not_found" };
  }

  const data = userDoc.data();
  const companyId = data.companyId;
  const role = data.role;

  if (!companyId || !role) {
    return { updated: false, reason: "no_company_or_role" };
  }

  await setTenantClaims(uid, companyId, role);
  return { updated: true };
});

module.exports = { syncTenantClaims };
