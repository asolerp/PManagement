const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationUpdateCheckList = functions.firestore
  .document('incidences/{incidenceId}')
  .onUpdate(async (change, context) => {
    try {
      const updatedIncidence = change.after.data();
      const userToken = updatedIncidence.user.token;

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const listTokens = adminTokens.concat([userToken]);

      let notification = {
        title: 'Actulaización 🚀',
        body: `Ha habido cambios en la incidencia!`,
      };

      let data = {
        type: 'entity',
        collection: 'incidences',
        docId: context.params.incidenceId,
      };

      await admin.messaging().sendMulticast({
        tokens: listTokens,
        notification,
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationUpdateCheckList;
