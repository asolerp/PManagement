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
  sendPushNotificationAsignedIncidence,
} = require('./notifications/incidences');

const {
  sendPushNotificationJobMessage,
  sendPushNotificationNewJob,
} = require('./notifications/jobs');

cloudinary.config({
  cloud_name: 'enalbis',
  api_key: '152722439921117',
  api_secret: '2vw8GysZv9EUsv9qEToqrZueaa4',
});

admin.initializeApp(functions.config().firebase);

exports.newUser = functions.auth.user().onCreate((user) => {
  admin.firestore().collection('users').doc(user.uid).set({email: user.email});
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

exports.sendPushNotificationAsignedIncidence =
  sendPushNotificationAsignedIncidence;

// JOBS

exports.sendPushNotificationJobMessage = sendPushNotificationJobMessage;
exports.sendPushNotificationNewJob = sendPushNotificationNewJob;

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

exports.deletePhotoCloudinary = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    const {photoIds} = data;

    console.log(photoIds);

    await cloudinary.api.delete_resources(photoIds, (error, result) => {
      console.log('error', error);
      console.log('result', result);
    });
  });

exports.recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data, context) => {
    const {path, collection, docId} = data;
    console.log(
      `User ${context.auth.uid} has requested to delete path ${path} with collection ${collection}`,
    );

    const collectionFolders = {
      checklists: 'CheckLists',
      incidences: 'Incidences',
      jobs: 'Jobs',
    };

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true,
      token: functions.config().fb.token,
    });

    await cloudinary.api.delete_resources_by_prefix(
      `PortManagement/${collectionFolders[collection]}/${docId}`,
      (error, result) => {
        console.log(result, error);
      },
    );

    return {
      path: path,
    };
  });
