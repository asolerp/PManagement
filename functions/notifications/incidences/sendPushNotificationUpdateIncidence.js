const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../../utils');

const sendPushNotificationUpdateCheckList = functions.region(REGION).firestore
  .document('incidences/{incidenceId}')
  .onUpdate(async (change, context) => {
    try {
      const updatedIncidence = change.after.data();
      const beforeIncidence = change.before.data();

      if (beforeIncidence.state !== updatedIncidence.state) {
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
        const listTokens = adminTokens.concat(workersTokens);

        const cleanListTokens = listTokens.filter((t) => t !== undefined);

        let notification = {
          title: 'Actualización 🚀',
          body: `Ha habido cambios en el estado de la incidencia!`,
        };

        let data = {
          type: 'entity',
          collection: 'incidences',
          docId: context.params.incidenceId,
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
      }
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationUpdateCheckList;
