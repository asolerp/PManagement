const admin = require('firebase-admin');

let cloudinary;

const { createNewUser } = require('./admin/createNewUser');
const { masterKeyLogin } = require('./admin/masterKeyLogin');
const { notifyOwner } = require('./admin/notifyOwner');
const { deleteUser } = require('./admin/deleteUser');
const { adminChangePassword } = require('./admin/adminChangePassword');
const {
  moveToRecycleBinWithSubcollection
} = require('./admin/moveToRecycleBinWithSubcollection');
const { deleteDocument } = require('./admin/deleteDocument');

// Notifications
const {
  sendPushNotificationFinishedChecklist,
  sendPushNotificationNewAsignedChecklist,
  sendPushNotificationNewChecklistMessage
} = require('./notifications/checklists');

const {
  sendPushNotificationUpdateIncidence,
  sendPushNotificationNewIncidence,
  sendPushNotificationNewIncidenceMessage,
  sendPushNotificationAsignedIncidence,
  incidentStateUpdatedAt,
  scheduledIncidenceReminders
} = require('./notifications/incidences');

// Audit
const {
  auditLogIncidenceCreated,
  auditLogIncidenceUpdated,
  auditLogIncidenceDeleted,
  auditLogJobCreated,
  auditLogJobUpdated,
  auditLogJobDeleted,
  auditLogChecklistCreated,
  auditLogChecklistUpdated,
  auditLogChecklistDeleted
} = require('./audit/auditLog');

const {
  sendPushNotificationJobMessage,
  sendPushNotificationNewJob
} = require('./notifications/jobs');

const { createJobsForQuadrant } = require('./admin/createJobsForQuadrant');
const { optimizeRoute } = require('./admin/optimizeRoute');
const {
  proposeQuadrantAssignment
} = require('./admin/proposeQuadrantAssignment');
const {
  generateEmailToOwnerTemplate
} = require('./admin/generateEmailToOwnerTemplate');
const {
  restoreDocumentWithSubcollection
} = require('./admin/restoreDocumentWithSubcollection');
const { updateOwnerHouse } = require('./admin/updateOwnerHouse');
const { REGION } = require('./utils');

// Time Tracking
const {
  exportTimeTrackingToExcel
} = require('./timeTracking/exportTimeTrackingToExcel');
const {
  sendTimeTrackingEmail
} = require('./timeTracking/sendTimeTrackingEmail');
const {
  scheduledMonthlyReport
} = require('./timeTracking/scheduledMonthlyReport');
const { testMonthlyReport } = require('./timeTracking/testMonthlyReport');
const {
  sendMonthlyReportManually
} = require('./timeTracking/sendMonthlyReportManually');

// Agent (Telegram Bot + AI)
const { telegramWebhook } = require('./agent');

// Work Shifts
const {
  onEntranceCreated,
  onEntranceUpdated,
  getWorkShifts,
  getWorkShiftStats,
  getWorkers,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
  migrateEntrancesToWorkShifts
} = require('./workShifts');

// v2 imports for inline functions
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onCall } = require('firebase-functions/v2/https');

admin.initializeApp();

/// ADMIN

require('./admin/restoreUserPassword');
exports.updateOwnerHouse = updateOwnerHouse;
exports.createNewUser = createNewUser;
exports.masterKeyLogin = masterKeyLogin;
exports.notifyOwner = notifyOwner;
exports.deleteUser = deleteUser;
exports.moveToRecycleBinWithSubcollection = moveToRecycleBinWithSubcollection;
exports.restoreDocumentWithSubcollection = restoreDocumentWithSubcollection;
exports.deleteDocument = deleteDocument;
exports.adminChangePassword = adminChangePassword;

// CHECKLISTS

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

exports.incidentStateUpdatedAt = incidentStateUpdatedAt;
exports.scheduledIncidenceReminders = scheduledIncidenceReminders;

// AUDIT

exports.auditLogIncidenceCreated = auditLogIncidenceCreated;
exports.auditLogIncidenceUpdated = auditLogIncidenceUpdated;
exports.auditLogIncidenceDeleted = auditLogIncidenceDeleted;
exports.auditLogJobCreated = auditLogJobCreated;
exports.auditLogJobUpdated = auditLogJobUpdated;
exports.auditLogJobDeleted = auditLogJobDeleted;
exports.auditLogChecklistCreated = auditLogChecklistCreated;
exports.auditLogChecklistUpdated = auditLogChecklistUpdated;
exports.auditLogChecklistDeleted = auditLogChecklistDeleted;

// JOBS

exports.sendPushNotificationJobMessage = sendPushNotificationJobMessage;
exports.sendPushNotificationNewJob = sendPushNotificationNewJob;
exports.createJobsForQuadrant = createJobsForQuadrant;
exports.optimizeRoute = optimizeRoute;
exports.proposeQuadrantAssignment = proposeQuadrantAssignment;
exports.generateEmailToOwnerTemplate = generateEmailToOwnerTemplate;

// AGENT
exports.telegramWebhook = telegramWebhook;

// TIME TRACKING

exports.exportTimeTrackingToExcel = exportTimeTrackingToExcel;
exports.sendTimeTrackingEmail = sendTimeTrackingEmail;
exports.scheduledMonthlyReport = scheduledMonthlyReport;
exports.testMonthlyReport = testMonthlyReport;
exports.sendMonthlyReportManually = sendMonthlyReportManually;

// WORK SHIFTS
exports.onEntranceCreated = onEntranceCreated;
exports.onEntranceUpdated = onEntranceUpdated;
exports.getWorkShifts = getWorkShifts;
exports.getWorkShiftStats = getWorkShiftStats;
exports.getWorkers = getWorkers;
exports.createWorkShift = createWorkShift;
exports.updateWorkShift = updateWorkShift;
exports.deleteWorkShift = deleteWorkShift;
exports.migrateEntrancesToWorkShifts = migrateEntrancesToWorkShifts;

exports.updateProfileImage = onDocumentUpdated(
  { document: 'users/{userId}', region: REGION },
  async event => {
    console.log('Updating images');
    const userAfter = event.data.after.data();
    const userId = event.params.userId;
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('workersId', 'array-contains', userId)
        .get();
      querySnapshot.forEach(doc => {
        const job = doc.data();
        const findUserIndex = job.workers.findIndex(w => w.id === userId);
        job.workers[findUserIndex] = { ...userAfter, id: userId };
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  }
);

exports.updateHouseImageJobs = onDocumentUpdated(
  { document: 'houses/{houseId}', region: REGION },
  async event => {
    console.log('Updating images');
    const houseAfter = event.data.after.data();
    const houseId = event.params.houseId;
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('houseId', '==', houseId)
        .get();
      querySnapshot.forEach(doc => {
        const job = doc.data();
        console.log('job', job);
        job.house[0] = { ...houseAfter, id: houseId };
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  }
);

exports.deletePhotoCloudinary = onCall(
  { region: REGION, timeoutSeconds: 540, memory: '2GiB' },
  async request => {
    if (!cloudinary) {
      cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
    }
    const { photoIds } = request.data;
    console.log(photoIds);
    await cloudinary.api.delete_resources(photoIds, (error, result) => {
      console.log('error', error);
      console.log('result', result);
    });
  }
);

exports.recursiveDelete = onCall(
  { region: REGION, timeoutSeconds: 540, memory: '2GiB' },
  async request => {
    const firebase_tools = require('firebase-tools');
    const { path, collection } = request.data;

    console.log(
      `User ${request.auth.uid} has requested to delete path ${path} with collection ${collection}`
    );

    await firebase_tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true,
      force: true,
      token: process.env.FB_TOKEN
    });

    const bucket = admin.storage().bucket();

    await bucket.deleteFiles({
      prefix: path
    });

    return { path };
  }
);
