const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { removeUserActionToken, REGION } = require("../../utils");

const sendPushNotificationNewIncidence = onDocumentCreated(
  {
    document: "incidents/{incidenceId}",
    region: REGION,
  },
  async (event) => {
    const incidence = event.data.data();

    try {
      const companyId = incidence.companyId;

      const adminsQuery = companyId
        ? admin
            .firestore()
            .collection("users")
            .where("role", "==", "admin")
            .where("companyId", "==", companyId)
        : admin.firestore().collection("users").where("role", "==", "admin");

      const adminsSnapshot = await adminsQuery.get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      const listTokens = removeUserActionToken(
        adminTokens,
        incidence.user.token,
      );

      const cleanListTokens = listTokens.filter((t) => t !== undefined);
      if (cleanListTokens.length === 0) return;

      const notification = {
        title: "Nueva incidencia! ⚠️",
        body: `${incidence.user.firstName} ha creado una nueva incidencia`,
      };

      const data = {
        type: "entity",
        collection: "incidents",
        docId: event.params.incidenceId,
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
  },
);

module.exports = sendPushNotificationNewIncidence;
