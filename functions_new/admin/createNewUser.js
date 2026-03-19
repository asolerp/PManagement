const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { genPassword, REGION } = require("../utils");
const { requireAdmin, setTenantClaims } = require("../lib/tenantAuth");

const DEFAULT_PHOTO_URL = "";

const createNewUser = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "2GiB" },
  async (request) => {
    const tenant = await requireAdmin(request);

    const { name, surname, email, phone, gender, language, role } =
      request.data;
    const password = genPassword();

    if (!email || !name || !surname || !role) {
      throw new HttpsError(
        "invalid-argument",
        "name, surname, email, and role are required.",
      );
    }

    const companyDoc = await admin
      .firestore()
      .collection("companies")
      .doc(tenant.companyId)
      .get();

    if (companyDoc.exists) {
      const company = companyDoc.data();
      const usersSnap = await admin
        .firestore()
        .collection("users")
        .where("companyId", "==", tenant.companyId)
        .count()
        .get();

      const currentCount = usersSnap.data().count;
      if (company.maxUsers && currentCount >= company.maxUsers) {
        throw new HttpsError(
          "resource-exhausted",
          `User limit reached (${company.maxUsers}). Upgrade your plan.`,
        );
      }
    }

    try {
      const newUser = await admin.auth().createUser({
        email,
        emailVerified: false,
        password,
        displayName: `${name} ${surname}`,
        photoURL: DEFAULT_PHOTO_URL,
        disabled: false,
      });

      await admin
        .firestore()
        .collection("users")
        .doc(newUser.uid)
        .set({
          firstName: name,
          lastName: surname,
          language: language || "es",
          phone: phone || "",
          gender: gender || "",
          profileImage: {
            original: DEFAULT_PHOTO_URL,
            small: DEFAULT_PHOTO_URL,
          },
          role,
          email,
          companyId: tenant.companyId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      await setTenantClaims(newUser.uid, tenant.companyId, role);

      return { userId: newUser.uid };
    } catch (err) {
      console.error("Error creating user:", err);

      if (err.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "An account with this email already exists.",
        );
      }

      throw new HttpsError("internal", "Failed to create user.", err.message);
    }
  },
);

module.exports = {
  createNewUser,
};
