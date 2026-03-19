const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { removeUserActionToken, REGION } = require("../../utils");

const sendPushNotificationUpdateCheckList = onDocumentUpdated(
  {
    document: "checklists/{checklistId}/checks/{checkId}",
    region: REGION,
  },
  async (event) => {
    let workers;
    let workersTokens = [];
    const check = event.data.after.data();
    const oldCheck = event.data.before.data();
    if (!oldCheck.done && check.done) {
      try {
        const checklistSnapshot = await admin
          .firestore()
          .collection("checklists")
          .doc(event.params.checklistId)
          .get();

        const checklistData = checklistSnapshot.data();
        const companyId = checklistData.companyId;

        const adminsQuery = companyId
          ? admin
              .firestore()
              .collection("users")
              .where("role", "==", "admin")
              .where("companyId", "==", companyId)
          : admin.firestore().collection("users").where("role", "==", "admin");

        const adminsSnapshot = await adminsQuery.get();

        if (checklistData.workersId) {
          workers = await Promise.all(
            checklistData.workersId.map(
              async (workerId) =>
                await admin.firestore().collection("users").doc(workerId).get(),
            ),
          );

          workersTokens = workers
            .filter((worker) => worker.data().token)
            .map((worker) => worker.data().token);
        }

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

        const listTokens = removeUserActionToken(
          adminTokens.concat(workersTokens),
          check.worker.token,
        );

        const cleanListTokens = listTokens.filter((t) => t !== undefined);
        if (cleanListTokens.length === 0) return;

        const notification = {
          title: "Nuevo trabajo completado! 🚀",
          body: `${check.worker.firstName} ha compleatdo ${
            check.locale.es
          } en ${checklistData.house[0].houseName}`,
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
    }
  },
);

module.exports = sendPushNotificationUpdateCheckList;
