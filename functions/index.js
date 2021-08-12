const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

const cloudinary = require('cloudinary').v2;

// Notifications
const {
  sendPushNotificationNewAsignedChecklist,
  sendPushNotificationNewChecklistMessage,
  sendPushNotificationUpdateCheckList,
} = require('./notifications/checklists');

const {
  sendPushNotificationUpdateIncidence,
  sendPushNotificationNewIncidence,
  sendPushNotificationNewIncidenceMessage,
} = require('./notifications/incidences');

cloudinary.config({
  cloud_name: 'enalbis',
  api_key: '152722439921117',
  api_secret: '2vw8GysZv9EUsv9qEToqrZueaa4',
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const FieldValue = require('firebase-admin').firestore.FieldValue;

admin.initializeApp(functions.config().firebase);

exports.newUser = functions.auth.user().onCreate((user) => {
  admin.firestore().collection('users').doc(user.uid).set({email: user.email});
});

exports.onCreateJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate((snap, context) => {
    const jobCreated = snap.data();

    const addNewStats = () => {
      admin.firestore().collection('stats').add({
        jobId: snap.id,
        priority: jobCreated.priority,
        date: jobCreated.date,
        done: false,
      });
    };

    return Promise.all([addNewStats()]);
  });

exports.setCheckListAsFinished = functions.firestore
  .document('checklists/{checklistId}')
  .onUpdate(async (change, context) => {
    try {
      const checkBefore = change.before.data();
      const checkAfter = change.after.data();
      if (checkAfter.done === checkAfter.total) {
        await admin
          .firestore()
          .collection('checklists')
          .doc(context.params.checklistId)
          .update({
            finished: true,
          });
      }
      if (checkBefore.finished && checkAfter.done < checkAfter.total) {
        await admin
          .firestore()
          .collection('checklists')
          .doc(context.params.checklistId)
          .update({
            finished: false,
          });
      }
    } catch (err) {
      console.log(err);
    }
  });

// CHECKLISTS

exports.sendPushNotificationUpdateCheckList =
  sendPushNotificationUpdateCheckList;

exports.sendPushNotificationNewChecklistMessage =
  sendPushNotificationNewChecklistMessage;

exports.sendPushNotificationNewAsignedChecklist =
  sendPushNotificationNewAsignedChecklist;

// INCIDENCES

exports.sendPushNotificationUpdateIncidence =
  sendPushNotificationUpdateIncidence;

exports.sendPushNotificationNewIncidence = sendPushNotificationNewIncidence;

exports.sendPushNotificationNewIncidenceMessage =
  sendPushNotificationNewIncidenceMessage;

exports.sendPushNotificationNewMessage = functions.firestore
  .document('jobs/{jobId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();

      const jobSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .get();

      const workersId = jobSnapshot.data().workersId;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = users.map((user) => user.data().token);
      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      let notification = {
        title: 'Tienes un nuevo mensaje 💬',
        body: message.text
          ? `${
              message.user.name + 'dice: ' + message.text.length > 25
                ? message.text.substring(0, 25 - 3) + '...'
                : message.text
            }`
          : 'Nueva imagen...',
      };

      await admin.messaging().sendMulticast({
        tokens: adminTokens.concat(workersTokens),
        notification,
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.updateProfileImage = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    console.log('Updating images');
    const userAfter = change.after.data();
    // Create a new batch instance
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('workersId', 'array-contains', context.params.userId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        const findUserIndex = job.workers.findIndex(
          (w) => w.id === context.params.userId,
        );
        job.workers[findUserIndex] = {...userAfter, id: context.params.userId};
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  });

exports.updateHouseImageJobs = functions.firestore
  .document('houses/{houseId}')
  .onUpdate(async (change, context) => {
    console.log('Updating images');
    const houseAfter = change.after.data();
    // Create a new batch instance
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('houseId', '==', context.params.houseId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        console.log('job', job);
        job.house[0] = {...houseAfter, id: context.params.houseId};
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  });

exports.deletePhotoCloudinary = functions.firestore
  .document('checklists/{checklistId}/checks/{checkId}/photos/{photoId}')
  .onDelete(async (snap, context) => {
    const deletePhoto = snap.data();
    await cloudinary.uploader.destroy(
      deletePhoto.ref,
      {resource_type: 'image'},
      (error, result) => {
        console.log(result, error);
      },
    );
  });

exports.recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data, context) => {
    // Only allow admin users to execute this function.

    const {path, collection} = data;
    console.log(
      `User ${context.auth.uid} has requested to delete path ${path} with collection ${collection}`,
    );

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true,
      token: functions.config().fb.token,
    });

    return {
      path: path,
    };
  });
