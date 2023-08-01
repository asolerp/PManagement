const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationNewChecklistMessage = functions.firestore
  .document('checklists/{checklistId}')
  .onUpdate(async (change, context) => {
    const checklist = change.after.data();

    const {street, owner} = checklist.house[0];

    const ownerSnapshot = await admin
      .firestore()
      .collection('users')
      .doc(owner)
      .get();

    const ownerToken = ownerSnapshot.data().token;
    const ownerNotificationStatus = ownerSnapshot.data().notifications;

    if (checklist.finished) {
      try {
        const adminsSnapshot = await admin
          .firestore()
          .collection('users')
          .where('role', '==', 'admin')
          .get();

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
        const cleanListTokens = adminTokens.filter((t) => t !== undefined);

        if (ownerNotificationStatus && ownerToken) {
          cleanListTokens.push(ownerToken);
        }

        let notification = {
          title: `Checklist finalizado en ${street}`,
          body: `Se ha enviado el resumen del checklist al propietario`,
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
    }
  });

module.exports = sendPushNotificationNewChecklistMessage;
