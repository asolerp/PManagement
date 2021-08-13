const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken} = require('../../utils');

const sendPushNotificationJobMessage = functions.firestore
  .document('jobs/{jobId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    try {
      const jobSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .get();

      const messageSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .collection('messages')
        .doc(context.params.messageId)
        .get();

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const userToken = messageSnapshot.data().user.token;
      const task = jobSnapshot.data().task;

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const workersTokens = jobSnapshot
        .data()
        .workers.map((worker) => worker.token);

      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        userToken,
      );

      let notification = {
        title: 'Nuevo mensaje! 📣',
        body: `${message.user.name} ha escrito en el trabajo`,
      };

      let data = {
        type: 'chat',
        collection: 'jobs',
        task: JSON.stringify(task),
        docId: context.params.jobId,
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

module.exports = sendPushNotificationJobMessage;
