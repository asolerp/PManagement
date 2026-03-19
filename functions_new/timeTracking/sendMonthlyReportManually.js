const admin = require("firebase-admin");
const { REGION } = require("../utils");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdmin } = require("../lib/tenantAuth");
const {
  generateMonthlyAndAnnualReports,
} = require("./exportMonthlyAndAnnualReports");

/**
 * Callable function to send monthly report manually
 * Can be triggered from the app with custom date range and recipients
 */
exports.sendMonthlyReportManually = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "1GiB" },
  async (request) => {
    try {
      const tenant = await requireAdmin(request);

      const { startDate, endDate, recipients, workerId } = request.data;

      if (!startDate || !endDate || !recipients || recipients.length === 0) {
        throw new HttpsError(
          "invalid-argument",
          "startDate, endDate, and recipients are required.",
        );
      }

      console.log(`Manual report requested by ${request.auth.uid}`);
      console.log(`Period: ${startDate} to ${endDate}`);
      console.log(`Recipients: ${recipients.join(", ")}`);

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Generate both Excel files
      const exportResult = await generateMonthlyAndAnnualReports(
        startDate,
        endDate,
        workerId || null,
        tenant.companyId,
      );

      if (!exportResult || !exportResult.success) {
        throw new HttpsError("internal", "Failed to generate Excel reports");
      }

      // Calculate summary statistics
      const startTimestamp = admin.firestore.Timestamp.fromDate(startDateObj);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endDateObj);

      let query = admin
        .firestore()
        .collection("timeEntries")
        .where("companyId", "==", tenant.companyId);

      if (workerId) {
        query = query.where("worker.id", "==", workerId);
      }
      query = query
        .where("date", ">=", startTimestamp)
        .where("date", "<=", endTimestamp);

      const snapshot = await query.get();

      // Calculate stats
      const workerStats = {};
      let totalRecords = 0;
      let completedRecords = 0;
      let pendingRecords = 0;

      snapshot.forEach((doc) => {
        const entrance = doc.data();
        totalRecords++;

        const workerName =
          entrance.worker?.name ||
          `${entrance.worker?.firstName || ""} ${entrance.worker?.secondName || ""}`.trim() ||
          entrance.worker?.email ||
          "Desconocido";

        if (!workerStats[workerName]) {
          workerStats[workerName] = {
            totalMinutes: 0,
            days: 0,
            pending: 0,
          };
        }

        if (entrance.exitDate) {
          completedRecords++;
          const entryMs =
            entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
          const exitMs =
            entrance.exitDate.seconds * 1000 +
            entrance.exitDate.nanoseconds / 1000000;
          const diffMinutes = Math.floor((exitMs - entryMs) / (1000 * 60));
          workerStats[workerName].totalMinutes += diffMinutes;
          workerStats[workerName].days += 1;
        } else {
          pendingRecords++;
          workerStats[workerName].pending += 1;
        }
      });

      console.log(
        `Manual report generated (email disabled). ${totalRecords} records.`,
      );

      return {
        success: true,
        message: "Reports generated. Email sending is disabled.",
        recordCount: totalRecords,
        workerCount: exportResult.workerCount,
        files: {
          monthly: exportResult.monthly.fileName,
          annual: exportResult.annual.fileName,
        },
        downloadUrls: {
          monthly: exportResult.monthly.downloadUrl,
          annual: exportResult.annual.downloadUrl,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("❌ Error sending manual report:", error);
      throw new HttpsError(
        "internal",
        "Failed to send reports.",
        error.message,
      );
    }
  },
);
