const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { removeUserActionToken, REGION } = require("../../utils");

const sendPushNotificationNewIncidenceMessage = functions
  .region(REGION)
  .firestore.document("incidents/{incidenceId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();

    try {
      const incidenceSnapshot = await admin
        .firestore()
        .collection("incidents")
        .doc(context.params.incidenceId)
        .get();

      const incidenceData = incidenceSnapshot.data();
      const companyId = incidenceData.companyId;
      if (!companyId) return;

      const adminsSnapshot = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "admin")
        .where("companyId", "==", companyId)
        .get();

      const workers = await Promise.all(
        incidenceData.workersId.map(
          async (workerId) =>
            await admin.firestore().collection("users").doc(workerId).get(),
        ),
      );

      const workersTokens = workers
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        message.user.token,
      );

      const cleanListTokens = listTokens.filter((t) => t !== undefined);
      if (cleanListTokens.length === 0) return;

      const notification = {
        title: "Nuevo mensaje! 📣",
        body: `${message.user.name} ha escrito en la incidencia`,
      };

      const data = {
        type: "chat",
        collection: "incidents",
        docId: context.params.incidenceId,
      };

      await admin.messaging().sendMulticast({
        tokens: cleanListTokens,
        notification,
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationNewIncidenceMessage;
