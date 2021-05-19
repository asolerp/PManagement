const functions = require('firebase-functions');
const admin = require('firebase-admin');

const sendPushNotificationUpdateCheckList = functions.firestore
  .document('checklists/{checklistId}/checks/{checkId}')
  .onUpdate(async (change, context) => {
    try {
      const checkAfter = change.after.data();

      if (checkAfter.done) {
        const updatedChecklistSnapshot = await admin
          .firestore()
          .collection('checklists')
          .doc(context.params.checklistId)
          .get();

        const notificationUpdateChecklist = {
          title: 'Actualización de trabajo',
          body: `${checkAfter.worker.firstName} ha completado la tarea ${
            checkAfter.title
          } en ${updatedChecklistSnapshot.data().house[0].houseName}.`,
        };

        const adminsSnapshot = await admin
          .firestore()
          .collection('users')
          .where('role', '==', 'admin')
          .get();

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

        let data = {
          screen: 'Check',
          checklistId: context.params.checklistId,
        };

        await admin.messaging().sendMulticast({
          tokens: adminTokens,
          apns: {
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
          notification: notificationUpdateChecklist,
          data,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationUpdateCheckList;
