const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken} = require('../utils');

const sendPushNotificationNewChecklistMessage = functions.firestore
  .document('checklists/{checklistId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    try {
      const checklistSnapshot = await admin
        .firestore()
        .collection('checklists')
        .doc(context.params.checklistId)
        .get();

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const workersId = checklistSnapshot.data().workersId;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const workersTokens = users.map((user) => user.data().token);
      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        message.user.token,
      );

      let notification = {
        title: 'Tienes un nuevo mensaje!',
        body: `Mensaje!`,
      };

      let data = {
        type: 'chat',
        collection: 'checklists',
        docId: context.params.checklistId,
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
