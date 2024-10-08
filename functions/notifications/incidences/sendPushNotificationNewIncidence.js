const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { removeUserActionToken, REGION } = require('../../utils');

const sendPushNotificationNewIncidence = functions
  .region(REGION)
  .firestore.document('incidences/{incidenceId}')
  .onCreate(async (snap, context) => {
    const incidence = snap.data();

    try {
      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map(doc => doc.data().token);

      const listTokens = removeUserActionToken(
        adminTokens,
        incidence.user.token
      );

      const cleanListTokens = listTokens.filter(t => t !== undefined);

      let notification = {
        title: 'Nueva incidencia! ⚠️',
        body: `${incidence.user.firstName} ha creado una nueva incidencia`
      };

      let data = {
        type: 'entity',
        collection: 'incidences',
        docId: context.params.incidenceId
      };

      await admin.messaging().sendMulticast({
        tokens: cleanListTokens,
        notification,
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        },
        data
      });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = sendPushNotificationNewIncidence;
