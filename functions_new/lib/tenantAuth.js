/**
 * Tenant authentication middleware for Cloud Functions.
 *
 * Provides helpers to:
 * 1. Verify the caller is authenticated
 * 2. Extract companyId + role from Custom Claims
 * 3. Verify admin role within a company
 * 4. Scope Firestore queries to the caller's company
 */

const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

/**
 * Extracts and validates tenant context from a callable function's request.
 * Accepts both v2 request objects (request.auth) and legacy context objects.
 * Returns { uid, companyId, role } or throws an HttpsError.
 */
async function getTenantContext(requestOrContext) {
  const auth = requestOrContext.auth;
  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { uid, token } = auth;
  let { companyId, role } = token;

  if (!companyId) {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const userData = userDoc.data();
    companyId = userData.companyId;
    role = userData.role;

    if (!companyId) {
      throw new HttpsError(
        "failed-precondition",
        "User is not associated with any company.",
      );
    }
  }

  return { uid, companyId, role };
}

/**
 * Same as getTenantContext but also enforces admin role.
 */
async function requireAdmin(requestOrContext) {
  const tenant = await getTenantContext(requestOrContext);

  if (tenant.role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Only administrators can perform this action.",
    );
  }

  return tenant;
}

/**
 * Reads companyId from a Firestore document path.
 * Useful inside triggers where there's no auth context.
 */
async function getCompanyIdFromDoc(collectionName, docId) {
  const doc = await admin
    .firestore()
    .collection(collectionName)
    .doc(docId)
    .get();

  return doc.exists ? doc.data().companyId : null;
}

/**
 * Reads companyId from a user document.
 */
async function getCompanyIdFromUser(userId) {
  return getCompanyIdFromDoc("users", userId);
}

/**
 * Returns a Firestore query scoped to a specific company.
 */
function scopedCollection(collectionName, companyId) {
  return admin
    .firestore()
    .collection(collectionName)
    .where("companyId", "==", companyId);
}

/**
 * Sets Firebase Auth custom claims for a user.
 */
async function setTenantClaims(uid, companyId, role) {
  const currentUser = await admin.auth().getUser(uid);
  const currentClaims = currentUser.customClaims || {};

  await admin.auth().setCustomUserClaims(uid, {
    ...currentClaims,
    companyId,
    role,
  });
}

module.exports = {
  getTenantContext,
  requireAdmin,
  getCompanyIdFromDoc,
  getCompanyIdFromUser,
  scopedCollection,
  setTenantClaims,
};
