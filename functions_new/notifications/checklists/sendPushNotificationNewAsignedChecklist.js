const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { REGION } = require("../../utils");

const sendPushNotificationNewAsignedChecklist = onDocumentCreated(
  {
    document: "checklists/{checklistId}",
    region: REGION,
  },
  async (event) => {
    const checklist = event.data.data();

    try {
      const workersId = checklist.workersId;
      if (!workersId || workersId.length === 0) return;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection("users").doc(workerId).get(),
        ),
      );

      const workersTokens = users
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const cleanListTokens = workersTokens.filter((t) => t !== undefined);
      if (cleanListTokens.length === 0) return;

      const notification = {
        title: "Manos a la obra! 📝",
        body: `Se te ha asignado a un checklist! ✅`,
      };

      const data = {
        type: "entity",
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

module.exports = sendPushNotificationNewAsignedChecklist;
