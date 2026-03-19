const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");
const { requireAdmin } = require("../lib/tenantAuth");

const moveToRecycleBinWithSubcollection = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "2GiB" },
  async (request) => {
    const tenant = await requireAdmin(request);

    const docId = request.data.docId;
    if (!docId) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with document ID.",
      );
    }

    const originalDocRef = admin
      .firestore()
      .collection("checklists")
      .doc(docId);
    const docSnapshot = await originalDocRef.get();

    if (!docSnapshot.exists) {
      throw new HttpsError("not-found", "Document to move does not exist.");
    }

    const recycleData = docSnapshot.data();

    if (recycleData.companyId !== tenant.companyId) {
      throw new HttpsError(
        "permission-denied",
        "Cannot move documents from another company.",
      );
    }

    const recycleBinDocRef = admin
      .firestore()
      .collection("recycleBin")
      .doc(docId);

    await recycleBinDocRef.set(recycleData);

    const checkSubcollectionRef = originalDocRef.collection("checks");
    const checkSnapshot = await checkSubcollectionRef.get();

    if (!checkSnapshot.empty) {
      const copyPromises = checkSnapshot.docs.map(async (doc) => {
        const docData = doc.data();
        await recycleBinDocRef.collection("checks").doc(doc.id).set(docData);
        await doc.ref.delete();
      });

      await Promise.all(copyPromises);
    }

    await originalDocRef.delete();

    return {
      message: "Document and subcollection moved to recycle bin successfully.",
    };
  },
);

module.exports = { moveToRecycleBinWithSubcollection };
