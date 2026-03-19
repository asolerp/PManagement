const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { genPassword, REGION } = require("../utils");
const { setTenantClaims } = require("../lib/tenantAuth");
const { seedDefaultCatalog } = require("../lib/seedDefaultCatalog");

// Placeholder vacío para evitar 404; el UI puede mostrar inicial del nombre
const DEFAULT_PHOTO_URL = "";

const registerCompany = onCall(
  { region: REGION, timeoutSeconds: 60, memory: "256MiB", cors: true },
  async (request) => {
    const {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      password: userPassword,
      language = "es",
      gender = "male",
    } = request.data;

    if (!companyName || !email || !firstName || !lastName) {
      throw new HttpsError(
        "invalid-argument",
        "companyName, firstName, lastName, and email are required.",
      );
    }

    const db = admin.firestore();
    const password = userPassword || genPassword();

    try {
      const authUser = await admin.auth().createUser({
        email,
        emailVerified: false,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: DEFAULT_PHOTO_URL,
        disabled: false,
      });

      const companyRef = db.collection("companies").doc();
      const companyId = companyRef.id;

      await companyRef.set({
        name: companyName,
        plan: "free",
        maxUsers: 10,
        maxHouses: 20,
        ownerId: authUser.uid,
        onboardingComplete: false,
        settings: {
          language,
          timezone: "Europe/Madrid",
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db
        .collection("users")
        .doc(authUser.uid)
        .set({
          firstName,
          lastName,
          email,
          phone: phone || "",
          language,
          gender,
          role: "admin",
          companyId,
          profileImage: {
            original: DEFAULT_PHOTO_URL,
            small: DEFAULT_PHOTO_URL,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      await setTenantClaims(authUser.uid, companyId, "admin");

      try {
        await seedDefaultCatalog(companyId);
      } catch (seedErr) {
        console.warn(
          "registerCompany: seedDefaultCatalog failed (company created):",
          seedErr?.message || seedErr,
        );
      }

      const customToken = await admin.auth().createCustomToken(authUser.uid);

      return { companyId, userId: authUser.uid, customToken };
    } catch (err) {
      console.error("Error registering company:", err?.message, err?.code, err);

      if (err.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "An account with this email already exists.",
        );
      }

      throw new HttpsError(
        "internal",
        "Failed to register company.",
        String(err?.message || err?.code || "Unknown error"),
      );
    }
  },
);

module.exports = { registerCompany };
