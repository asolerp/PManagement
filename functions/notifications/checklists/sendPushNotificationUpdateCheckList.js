const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {removeUserActionToken, REGION} = require('../../utils');

const sendPushNotificationUpdateCheckList = functions.region(REGION).firestore
  .document('checklists/{checklistId}/checks/{checkId}')
  .onUpdate(async (change, context) => {
    let workers;
    let workersTokens = [];
    const check = change.after.data();
    const oldCheck = change.before.data();
    if (!oldCheck.done && check.done) {
      try {
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

        if (checklistSnapshot.data().workersId) {
          workers = await Promise.all(
            checklistSnapshot
              .data()
              .workersId.map(
                async (workerId) =>
                  await admin
                    .firestore()
                    .collection('users')
                    .doc(workerId)
                    .get(),
              ),
          );

          workersTokens = workers
            .filter((worker) => worker.data().token)
            .map((worker) => worker.data().token);
        }

        const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

        const listTokens = removeUserActionToken(
          adminTokens.concat(workersTokens),
          check.worker.token,
        );

        const cleanListTokens = listTokens.filter((t) => t !== undefined);

        let notification = {
          title: 'Nuevo trabajo completado! 🚀',
          body: `${check.worker.firstName} ha compleatdo ${
            check.locale.es
          } en ${checklistSnapshot.data().house[0].houseName}`,
        };

        let data = {
          type: 'entity',
          collection: 'checklists',
          docId: context.params.checklistId,
        };

        console.log('NOTIFY', cleanListTokens);

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

module.exports = sendPushNotificationUpdateCheckList;
