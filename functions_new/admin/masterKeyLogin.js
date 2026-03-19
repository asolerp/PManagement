const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");

const MASTER_KEY = process.env.MASTER_KEY;

const masterKeyLogin = onCall(
  { region: REGION, timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    const { email, masterKey } = request.data;

    if (!email || !masterKey) {
      throw new HttpsError(
        "invalid-argument",
        "Email and master key are required.",
      );
    }

    if (!MASTER_KEY) {
      throw new HttpsError(
        "failed-precondition",
        "Master key is not configured on the server.",
      );
    }

    if (masterKey !== MASTER_KEY) {
      throw new HttpsError("permission-denied", "Invalid master key.");
    }

    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch (_) {
        throw new HttpsError("not-found", "No user exists with this email.");
      }

      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userRecord.uid)
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};

      const customToken = await admin.auth().createCustomToken(userRecord.uid, {
        companyId: userData.companyId || null,
        role: userData.role || "admin",
      });

      return {
        customToken,
        uid: userRecord.uid,
        email: userRecord.email,
        companyId: userData.companyId || null,
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("Error in masterKeyLogin:", error);
      throw new HttpsError("internal", "Login failed.", error.message);
    }
  },
);

module.exports = { masterKeyLogin };
