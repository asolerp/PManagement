const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");
const { requireAdmin } = require("../lib/tenantAuth");

exports.adminChangePassword = onCall({ region: REGION }, async (request) => {
  const tenant = await requireAdmin(request);

  const { userId, newPassword } = request.data;

  if (!userId || !newPassword) {
    throw new HttpsError(
      "invalid-argument",
      "userId and newPassword are required.",
    );
  }

  if (newPassword.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "Password must be at least 6 characters.",
    );
  }

  const targetUser = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .get();

  if (!targetUser.exists || targetUser.data().companyId !== tenant.companyId) {
    throw new HttpsError(
      "permission-denied",
      "Cannot modify users from another company.",
    );
  }

  try {
    await admin.auth().updateUser(userId, { password: newPassword });

    console.log(
      `Admin ${tenant.uid} [${tenant.companyId}] changed password for user ${userId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    throw new HttpsError(
      "internal",
      "Failed to change password.",
      error.message,
    );
  }
});
