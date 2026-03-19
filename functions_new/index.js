const admin = require("firebase-admin");

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

const { createNewUser } = require("./admin/createNewUser");
const { masterKeyLogin } = require("./admin/masterKeyLogin");
const { notifyOwner } = require("./admin/notifyOwner");
const { deleteUser } = require("./admin/deleteUser");
const { adminChangePassword } = require("./admin/adminChangePassword");
const { registerCompany } = require("./admin/registerCompany");
const { syncTenantClaims } = require("./admin/syncTenantClaims");
const {
  moveToRecycleBinWithSubcollection,
} = require("./admin/moveToRecycleBinWithSubcollection");
const { deleteDocument } = require("./admin/deleteDocument");

const {
  sendPushNotificationFinishedChecklist,
  sendPushNotificationNewAsignedChecklist,
  sendPushNotificationNewChecklistMessage,
} = require("./notifications/checklists");

const {
  sendPushNotificationUpdateIncidence,
  sendPushNotificationNewIncidence,
  sendPushNotificationNewIncidenceMessage,
  sendPushNotificationAsignedIncidence,
  incidentStateUpdatedAt,
  scheduledIncidenceReminders,
} = require("./notifications/incidences");

const {
  sendPushNotificationJobMessage,
  sendPushNotificationNewJob,
} = require("./notifications/jobs");

const { createJobsForQuadrant } = require("./admin/createJobsForQuadrant");
const { optimizeRoute } = require("./admin/optimizeRoute");
const {
  proposeQuadrantAssignment,
} = require("./admin/proposeQuadrantAssignment");
const {
  restoreDocumentWithSubcollection,
} = require("./admin/restoreDocumentWithSubcollection");
const { updateOwnerHouse } = require("./admin/updateOwnerHouse");
const {
  generateEmailToOwnerTemplate,
} = require("./admin/generateEmailToOwnerTemplate");
const { telegramWebhook } = require("./agent");
const { REGION } = require("./utils");

const {
  exportTimeTrackingToExcel,
} = require("./timeTracking/exportTimeTrackingToExcel");
const {
  sendTimeTrackingEmail,
} = require("./timeTracking/sendTimeTrackingEmail");
const {
  scheduledMonthlyReport,
} = require("./timeTracking/scheduledMonthlyReport");
const { testMonthlyReport } = require("./timeTracking/testMonthlyReport");
const {
  sendMonthlyReportManually,
} = require("./timeTracking/sendMonthlyReportManually");

const {
  auditLogIncidentCreated,
  auditLogIncidentUpdated,
  auditLogIncidentDeleted,
  auditLogJobCreated,
  auditLogJobUpdated,
  auditLogJobDeleted,
  auditLogChecklistCreated,
  auditLogChecklistUpdated,
  auditLogChecklistDeleted,
} = require("./audit/auditLog");

const {
  onEntranceCreated,
  onEntranceUpdated,
  getWorkShifts,
  getWorkShiftStats,
  getWorkers,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
  migrateEntrancesToWorkShifts,
} = require("./workShifts");

admin.initializeApp();

/// ADMIN

require("./admin/restoreUserPassword");
exports.updateOwnerHouse = updateOwnerHouse;
exports.createNewUser = createNewUser;
exports.masterKeyLogin = masterKeyLogin;
exports.notifyOwner = notifyOwner;
exports.generateEmailToOwnerTemplate = generateEmailToOwnerTemplate;
exports.telegramWebhook = telegramWebhook;
exports.deleteUser = deleteUser;
exports.moveToRecycleBinWithSubcollection = moveToRecycleBinWithSubcollection;
exports.restoreDocumentWithSubcollection = restoreDocumentWithSubcollection;
exports.deleteDocument = deleteDocument;
exports.adminChangePassword = adminChangePassword;
exports.registerCompany = registerCompany;
exports.syncTenantClaims = syncTenantClaims;

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

// JOBS

exports.sendPushNotificationJobMessage = sendPushNotificationJobMessage;
exports.sendPushNotificationNewJob = sendPushNotificationNewJob;
exports.createJobsForQuadrant = createJobsForQuadrant;
exports.optimizeRoute = optimizeRoute;
exports.proposeQuadrantAssignment = proposeQuadrantAssignment;

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

// AUDIT LOG
exports.auditLogIncidentCreated = auditLogIncidentCreated;
exports.auditLogIncidentUpdated = auditLogIncidentUpdated;
exports.auditLogIncidentDeleted = auditLogIncidentDeleted;
exports.auditLogJobCreated = auditLogJobCreated;
exports.auditLogJobUpdated = auditLogJobUpdated;
exports.auditLogJobDeleted = auditLogJobDeleted;
exports.auditLogChecklistCreated = auditLogChecklistCreated;
exports.auditLogChecklistUpdated = auditLogChecklistUpdated;
exports.auditLogChecklistDeleted = auditLogChecklistDeleted;

exports.updateProfileImage = onDocumentUpdated(
  { document: "users/{userId}", region: REGION },
  async (event) => {
    const userAfter = event.data.after.data();
    const companyId = userAfter.companyId;
    if (!companyId) return;

    const userId = event.params.userId;
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection("jobs")
        .where("companyId", "==", companyId)
        .where("workersId", "array-contains", userId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        const findUserIndex = job.workers.findIndex((w) => w.id === userId);
        job.workers[findUserIndex] = { ...userAfter, id: userId };
        const docRef = admin.firestore().collection("jobs").doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  },
);

exports.updateHouseImageJobs = onDocumentUpdated(
  { document: "houses/{houseId}", region: REGION },
  async (event) => {
    const houseAfter = event.data.after.data();
    const companyId = houseAfter.companyId;
    if (!companyId) return;

    const houseId = event.params.houseId;
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection("jobs")
        .where("companyId", "==", companyId)
        .where("houseId", "==", houseId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        job.house[0] = { ...houseAfter, id: houseId };
        const docRef = admin.firestore().collection("jobs").doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  },
);

exports.recursiveDelete = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "2GiB" },
  async (request) => {
    const { getTenantContext } = require("./lib/tenantAuth");
    const tenant = await getTenantContext(request);

    const { path, collection } = request.data;

    const pathParts = path.split("/");
    if (pathParts.length >= 2) {
      const docRef = admin.firestore().doc(path);
      const doc = await docRef.get();
      if (
        doc.exists &&
        doc.data().companyId &&
        doc.data().companyId !== tenant.companyId
      ) {
        throw new HttpsError(
          "permission-denied",
          "Cannot delete resources from another company.",
        );
      }
    }

    console.log(
      `User ${tenant.uid} [${tenant.companyId}] deleting path ${path}`,
    );

    const firebase_tools = require("firebase-tools");
    await firebase_tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true,
      force: true,
      token: process.env.FB_TOKEN,
    });

    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: path });

    return { path };
  },
);
