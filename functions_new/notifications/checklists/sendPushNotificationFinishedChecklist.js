const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { REGION } = require("../../utils");

const sendPushNotificationFinishedChecklist = onDocumentUpdated(
  {
    document: "checklists/{checklistId}",
    region: REGION,
  },
  async (event) => {
    const checklist = event.data.after.data();
    const companyId = checklist.companyId;

    const { street } = checklist.house[0];

    if (checklist.finished) {
      try {
        const owner = await admin
          .firestore()
          .collection("users")
          .doc(checklist.house[0].owner.id)
          .get();

        const adminsQuery = companyId
          ? admin
              .firestore()
              .collection("users")
              .where("role", "==", "admin")
              .where("companyId", "==", companyId)
          : admin.firestore().collection("users").where("role", "==", "admin");

        const adminsSnapshot = await adminsQuery.get();

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
        const ownerToken = owner.data()?.token;
        const cleanListTokens = adminTokens.filter((t) => t !== undefined);

        const ownerNotification = {
          title: `Your checklist is ready in ${street}`,
          body: `You can check the results in the app`,
        };

        const notification = {
          title: `Checklist finalizado en ${street}`,
          body: `Se ha enviado el resumen del checklist al propietario`,
        };

        const data = {
          type: "entity",
          collection: "checklists",
          docId: event.params.checklistId,
        };

        if (ownerToken !== undefined) {
          await admin.messaging().sendMulticast({
            tokens: [ownerToken],
            notification: ownerNotification,
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
        }

        if (cleanListTokens.length > 0) {
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
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
);

module.exports = sendPushNotificationFinishedChecklist;
