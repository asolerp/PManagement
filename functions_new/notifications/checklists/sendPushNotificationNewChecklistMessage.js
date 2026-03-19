const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { removeUserActionToken, REGION } = require("../../utils");

const sendPushNotificationNewChecklistMessage = onDocumentCreated(
  {
    document: "checklists/{checklistId}/messages/{messageId}",
    region: REGION,
  },
  async (event) => {
    const message = event.data.data();

    try {
      const checklistSnapshot = await admin
        .firestore()
        .collection("checklists")
        .doc(event.params.checklistId)
        .get();

      const checklistData = checklistSnapshot.data();
      const companyId = checklistData.companyId;
      if (!companyId) return;

      const adminsQuery = admin
        .firestore()
        .collection("users")
        .where("role", "==", "admin")
        .where("companyId", "==", companyId);

      const adminsSnapshot = await adminsQuery.get();

      const workers = await Promise.all(
        checklistData.workersId.map(
          async (workerId) =>
            await admin.firestore().collection("users").doc(workerId).get(),
        ),
      );

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const workersTokens = workers
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        message.user.token,
      );

      const cleanListTokens = listTokens.filter((t) => t !== undefined);
      if (cleanListTokens.length === 0) return;

      const notification = {
        title: "Nuevo mensaje! 📣",
        body: `${message.user.name} ha escrito en el checklist`,
      };

      const data = {
        type: "chat",
        collection: "checklists",
        docId: event.params.checklistId,
      };

      await admin.messaging().sendMulticast({
        tokens: cleanListTokens,
        notification,
        apns: {
          payload: {
            aps: {
              "content-available": 1,
              mutableContent: 1,
              sound: "default",
            },
          },
        },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  },
);

module.exports = sendPushNotificationNewChecklistMessage;
