const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { REGION } = require("../../utils");

const sendPushNotificationUpdateIncidence = functions
  .region(REGION)
  .firestore.document("incidents/{incidenceId}")
  .onUpdate(async (change, context) => {
    try {
      const updatedIncidence = change.after.data();
      const beforeIncidence = change.before.data();

      if (beforeIncidence.state !== updatedIncidence.state) {
        const companyId = updatedIncidence.companyId;

        const adminsQuery = companyId
          ? admin
              .firestore()
              .collection("users")
              .where("role", "==", "admin")
              .where("companyId", "==", companyId)
          : admin.firestore().collection("users").where("role", "==", "admin");

        const adminsSnapshot = await adminsQuery.get();

        const workers = await Promise.all(
          updatedIncidence.workersId.map(
            async (workerId) =>
              await admin.firestore().collection("users").doc(workerId).get(),
          ),
        );

        const workersTokens = workers
          .filter((worker) => worker.data().token)
          .map((worker) => worker.data().token);

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
        const listTokens = adminTokens.concat(workersTokens);

        const cleanListTokens = listTokens.filter((t) => t !== undefined);
        if (cleanListTokens.length === 0) return;

        const notification = {
          title: "Actualización 🚀",
          body: `Ha habido cambios en el estado de la incidencia!`,
        };

        const data = {
          type: "entity",
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
      }
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationUpdateIncidence;
