const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationNewChecklistMessage = functions.firestore
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

      const workersTokens = users.map((user) => user.data().token);

      let notification = {
        title: 'Nueva asignación 👈',
        body: `Se te ha asignado a un checklist! ✅`,
      };

      let data = {
        type: 'entity',
        collection: 'checklists',
        docId: context.params.checklistId,
      };

      await admin.messaging().sendMulticast({
        tokens: workersTokens,
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
