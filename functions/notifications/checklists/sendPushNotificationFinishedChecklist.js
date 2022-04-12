const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationNewChecklistMessage = functions.firestore
  .document('checklists/{checklistId}')
  .onUpdate(async (change, context) => {
    const checklist = change.after.data();

    const {street} = checklist.house[0];

    if (checklist.finished) {
      try {
        const adminsSnapshot = await admin
          .firestore()
          .collection('users')
          .where('role', '==', 'admin')
          .get();

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

        const cleanListTokens = adminTokens.filter((t) => t !== undefined);

        let notification = {
          title: `Checklist finalizado en ${street}`,
          body: `Se te ha enviado el resumen del checklist al propietario`,
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
                sound: 'default',
              },
            },
          },
          data,
        });
      } catch (err) {
        console.log(err);
      }
    }
  });

module.exports = sendPushNotificationNewChecklistMessage;
