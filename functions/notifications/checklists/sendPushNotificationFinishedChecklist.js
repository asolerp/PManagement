const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../../utils');

const sendPushNotificationNewChecklistMessage = functions
  .region(REGION)
  .firestore.document('checklists/{checklistId}')
  .onUpdate(async (change, context) => {
    const checklist = change.after.data();

    const { street } = checklist.house[0];

    if (checklist.finished) {
      try {
        const owner = await admin
          .firestore()
          .collection('users')
          .doc(checklist.house[0].owner.id)
          .get();

        const adminsSnapshot = await admin
          .firestore()
          .collection('users')
          .where('role', '==', 'admin')
          .get();

        const adminTokens = adminsSnapshot.docs.map(doc => doc.data().token);
        const ownerToken = owner.token;
        const cleanListTokens = adminTokens.filter(t => t !== undefined);

        let ownerNotification = {
          title: `Your checklist is ready in ${street}`,
          body: `You can check the results in the app`
        };

        let notification = {
          title: `Checklist finalizado en ${street}`,
          body: `Se ha enviado el resumen del checklist al propietario`
        };

        let data = {
          type: 'entity',
          collection: 'checklists',
          docId: context.params.checklistId
        };

        if (ownerToken !== undefined) {
          await admin.messaging().sendMulticast({
            token: ownerToken,
            notification: ownerNotification,
            apns: {
              payload: {
                aps: {
                  'content-available': 1,
                  mutableContent: 1,
                  sound: 'default'
                }
              }
            },
            data
          });
        }

        await admin.messaging().sendMulticast({
          tokens: cleanListTokens,
          notification,
          apns: {
            payload: {
              aps: {
                'content-available': 1,
                mutableContent: 1,
                sound: 'default'
              }
            }
          },
          data
        });
      } catch (err) {
        console.log(err);
      }
    }
  });

module.exports = sendPushNotificationNewChecklistMessage;
