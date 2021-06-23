const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken} = require('../../utils');

const sendPushNotificationNewChecklistMessage = functions.firestore
  .document('incidences/{incidenceId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    try {
      const incidenceSnapshot = await admin
        .firestore()
        .collection('incidences')
        .doc(context.params.incidenceId)
        .get();

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const userToken = incidenceSnapshot.data().user.token;

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      const listTokens = removeUserActionToken(adminTokens, userToken);

      let notification = {
        title: 'Nuevo mensaje! 📣',
        body: `${message.user.name} ha escrito en la incidencia`,
      };

      let data = {
        type: 'chat',
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

module.exports = sendPushNotificationNewChecklistMessage;
