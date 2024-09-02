const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken, REGION} = require('../../utils');

const sendPushNotificationJobMessage = functions.region(REGION).firestore
  .document('jobs/{jobId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    try {
      const jobSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .get();

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const workers = await Promise.all(
        jobSnapshot
          .data()
          .workersId.map(
            async (workerId) =>
              await admin.firestore().collection('users').doc(workerId).get(),
          ),
      );

      const task = jobSnapshot.data().task;

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const workersTokens = workers
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        message.user.token,
      );

      const cleanListTokens = listTokens.filter((t) => t !== undefined);

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
        tokens: cleanListTokens,
        notification,
        android: {
          notification: {
            sound: 'default',
          },
        },
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
