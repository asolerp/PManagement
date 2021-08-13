const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken} = require('../../utils');

const sendPushNotificationUpdateCheckList = functions.firestore
  .document('checklists/{checklistId}/checks/{checkId}')
  .onUpdate(async (change, context) => {
    try {
      const check = change.after.data();

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
        updatedIncidence.workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = workers
        .filter((worker) => worker.data().token)
        .map((worker) => worker.data().token);

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);
      const listTokens = removeUserActionToken(
        adminTokens.concat(workersTokens),
        check.worker.token,
      );

      let notification = {
        title: 'Nuevo trabajo completado! 🚀',
        body: `${check.worker.firstName} ha compleatdo ${check.title} en ${
          checklistSnapshot.data().house[0].houseName
        }`,
      };

      let data = {
        type: 'entity',
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

module.exports = sendPushNotificationUpdateCheckList;
