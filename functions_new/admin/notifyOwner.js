const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { sendResumeChecklistOwner } = require("./sendResumeChecklistOwner");
const { REGION } = require("../utils");
const { getTenantContext } = require("../lib/tenantAuth");

const notifyOwner = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "2GiB" },
  async (request) => {
    const tenant = await getTenantContext(request);
    const { checkId } = request.data;

    try {
      const checklistRef = await admin
        .firestore()
        .collection("checklists")
        .doc(checkId)
        .get();

      if (!checklistRef.exists) {
        throw new HttpsError("not-found", "Checklist not found.");
      }

      const checklist = checklistRef.data();

      if (checklist.companyId && checklist.companyId !== tenant.companyId) {
        throw new HttpsError(
          "permission-denied",
          "Cannot access checklists from another company.",
        );
      }

      const checksRef = await admin
        .firestore()
        .collection("checklists")
        .doc(checkId)
        .collection("checks")
        .get();

      await admin
        .firestore()
        .collection("checklists")
        .doc(checkId)
        .update({ finished: true, send: true });

      const checks = checksRef.docs.map((doc) => doc.data());

      const ownerId = checklist.house[0].owner.id;

      const ownerRef = await admin
        .firestore()
        .collection("users")
        .doc(ownerId)
        .get();

      const owner = ownerRef.data();

      const splitAditionalEmails = owner?.aditionalEmail?.split(",");
      const aditionalEmails = splitAditionalEmails?.map((email) =>
        email.trim(),
      );

      const emailsSeparatedByComma = aditionalEmails?.join(",");

      console.log(
        `[${tenant.companyId}] Calling sendResumeChecklistOwner with checklistId:`,
        checkId,
      );

      await sendResumeChecklistOwner({
        email: owner?.aditionalEmail
          ? `${owner.email},${emailsSeparatedByComma}`
          : owner.email,
        checklist,
        checks,
        checklistId: checkId,
      });

      console.log(
        `[${tenant.companyId}] sendResumeChecklistOwner completed for checklistId:`,
        checkId,
      );
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error(err);
      throw new HttpsError("internal", "Failed to notify owner.");
    }
  },
);

module.exports = {
  notifyOwner,
};
