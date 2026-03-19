const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { REGION } = require("../utils");
const { requireAdmin } = require("../lib/tenantAuth");

const restoreDocumentWithSubcollection = onCall(
  { region: REGION },
  async (request) => {
    const tenant = await requireAdmin(request);

    const docId = request.data.docId;
    if (!docId) {
      throw new HttpsError(
        "invalid-argument",
        'The function must be called with the argument "docId".',
      );
    }

    const recycleBinDocRef = admin
      .firestore()
      .collection("recycleBin")
      .doc(docId);
    const originalDocRef = admin
      .firestore()
      .collection("checklists")
      .doc(docId);

    const docSnapshot = await recycleBinDocRef.get();
    if (!docSnapshot.exists) {
      throw new HttpsError(
        "not-found",
        "Document to restore does not exist in recycle bin.",
      );
    }
    const docData = docSnapshot.data();

    if (docData.companyId !== tenant.companyId) {
      throw new HttpsError(
        "permission-denied",
        "Cannot restore documents from another company.",
      );
    }

    await originalDocRef.set(docData);

    const checkSubcollectionRef = recycleBinDocRef.collection("checks");
    const checkSnapshot = await checkSubcollectionRef.get();

    if (!checkSnapshot.empty) {
      const restorePromises = checkSnapshot.docs.map((doc) => {
        const checkData = doc.data();
        return originalDocRef.collection("checks").doc(doc.id).set(checkData);
      });
      await Promise.all(restorePromises);
    }

    await Promise.all(
      checkSnapshot.docs.map((doc) =>
        checkSubcollectionRef.doc(doc.id).delete(),
      ),
    );
    await recycleBinDocRef.delete();

    return { message: "Document and subcollection restored successfully." };
  },
);

module.exports = { restoreDocumentWithSubcollection };
