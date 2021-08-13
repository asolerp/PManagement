const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken} = require('../../utils');

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

      const workers = await Promise.all(
        checklistSnapshot
          .data()
          .workersId.map(
            async (workerId) =>
              await admin.firestore().collection('users').doc(workerId).get(),
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

      let notification = {
        title: 'Nuevo mensaje! 📣',
        body: `${message.user.name} ha escrito en el checklist`,
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
