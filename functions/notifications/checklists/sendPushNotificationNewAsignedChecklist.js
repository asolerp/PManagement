const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../../utils');

const sendPushNotificationNewChecklistMessage = functions.region(REGION).firestore
  .document('checklists/{checklistId}')
  .onCreate(async (snap, context) => {
    const checklist = snap.data();

    try {
      const workersId = checklist.workersId;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = users
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const cleanListTokens = workersTokens.filter((t) => t !== undefined);

      let notification = {
        title: 'Manos a la obra! 📝',
        body: `Se te ha asignado a un checklist! ✅`,
      };

      let data = {
        type: 'entity',
        collection: 'checklists',
        docId: context.params.checklistId,
      };

      await admin.messaging().sendMulticast({
        tokens: cleanListTokens,
        notification,
        apns: {
          payload: {
            aps: {
              'content-available': 1,
              mutableContent: 1,
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
