const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

const cloudinary = require('cloudinary').v2;

const {createNewUser} = require('./admin/createNewUser');
const {notifyOwner} = require('./admin/notifyOwner');
const {deleteUser} = require('./admin/deleteUser');

// Cloudinary

const {uploadHousePhoto} = require('./cloudinary/uploadHousePhoto');
const {uploadProfilePhoto} = require('./cloudinary/uploadProfilePhoto');

// Notifications
const {
  sendPushNotificationFinishedChecklist,
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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

admin.initializeApp(functions.config().firebase);

/// CLOUDINARY

exports.uploadHousePhoto = uploadHousePhoto;
exports.uploadProfilePhoto = uploadProfilePhoto;

/// ADMIN

exports.createNewUser = createNewUser;
exports.notifyOwner = notifyOwner;
exports.deleteUser = deleteUser;

// CHECKLISTS

exports.sendPushNotificationUpdateCheckList =
  sendPushNotificationUpdateCheckList;

exports.sendPushNotificationNewChecklistMessage =
  sendPushNotificationNewChecklistMessage;

exports.sendPushNotificationNewAsignedChecklist =
  sendPushNotificationNewAsignedChecklist;

exports.sendPushNotificationFinishedChecklist =
  sendPushNotificationFinishedChecklist;

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

exports.updateHouseOwner = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    console.log('Updating owner');
    const userAfter = change.after.data();
    const batch = admin.firestore().batch();

    if (userAfter.role === 'owner') {
      try {
        const querySnapshot = await admin
          .firestore()
          .collection('houses')
          .where('owner.id', '==', context.params.userId)
          .get();
        querySnapshot.forEach((doc) => {
          const house = doc.data();
          house.owner = {
            ...userAfter,
            id: context.params.userId,
          };
          const docRef = admin.firestore().collection('houses').doc(doc.id);
          batch.update(docRef, job);
        });
        await batch.commit();
      } catch (err) {
        console.log(err);
      }
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
      force: true,
      token: process.env.FB_TOKEN,
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
