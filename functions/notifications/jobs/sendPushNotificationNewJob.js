const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationNewJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async (snap, context) => {
    try {
      const job = snap.data();

      const workers = await Promise.all(
        job.workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = workers
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const listTokens = workersTokens;

      let notification = {
        title: 'Nuevo trabajo 💪',
        body: `Se te ha asignado un nuevo trabajo!`,
      };

      let data = {
        type: 'entity',
        collection: 'jobs',
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

module.exports = sendPushNotificationNewJob;
