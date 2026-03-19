const admin = require("firebase-admin");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { REGION } = require("../utils");

const updateOwnerHouse = onDocumentUpdated(
  { document: "users/{userId}", region: REGION },
  async (event) => {
    const user = event.data.after.data();
    const userId = event.params.userId;
    const companyId = user.companyId;

    if (!companyId) return;

    try {
      const houses = await admin
        .firestore()
        .collection("properties")
        .where("companyId", "==", companyId)
        .where("owner.id", "==", userId)
        .get();

      const batch = admin.firestore().batch();

      houses.docs.forEach((doc) => {
        batch.set(doc.ref, { owner: { id: userId, ...user } }, { merge: true });
      });

      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  },
);

module.exports = { updateOwnerHouse };
