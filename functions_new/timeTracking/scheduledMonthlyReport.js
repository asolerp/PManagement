const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { REGION } = require("../utils");
const {
  generateMonthlyAndAnnualReports,
} = require("./exportMonthlyAndAnnualReports");

/**
 * Scheduled function to send monthly time tracking report
 * Runs automatically on the 1st day of each month at 9:00 AM (Europe/Madrid)
 * Sends report for the previous month to configured recipients
 */
exports.scheduledMonthlyReport = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB",
  })
  .pubsub.schedule("0 9 1 * *") // Día 1 de cada mes a las 9:00 AM
  .timeZone("Europe/Madrid")
  .onRun(async () => {
    try {
      console.log("Starting scheduled monthly time tracking report...");

      // Calculate previous month date range
      const today = new Date();
      const firstDayPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const lastDayPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      );

      firstDayPrevMonth.setHours(0, 0, 0, 0);
      lastDayPrevMonth.setHours(23, 59, 59, 999);

      const startDate = firstDayPrevMonth.toISOString();
      const endDate = lastDayPrevMonth.toISOString();

      console.log(`Report period: ${startDate} to ${endDate}`);

      // Get recipients from environment config or firestore
      let recipients = [];

      // Option 1: From Firebase Functions config (firebase functions:config:set)
      const configRecipients = functions.config().monthly_report?.recipients;
      if (configRecipients) {
        recipients = configRecipients.split(",").map((email) => email.trim());
      }
      // Option 2: From environment variables (process.env)
      else if (process.env.MONTHLY_REPORT_RECIPIENTS) {
        recipients = process.env.MONTHLY_REPORT_RECIPIENTS.split(",").map(
          (email) => email.trim(),
        );
      }
      // Option 3: From Firestore settings collection
      else {
        const settingsDoc = await admin
          .firestore()
          .collection("settings")
          .doc("timeTracking")
          .get();

        if (settingsDoc.exists) {
          recipients = settingsDoc.data().monthlyReportRecipients || [];
        }
      }

      if (!recipients || recipients.length === 0) {
        console.warn(
          "No recipients configured for monthly report. Skipping...",
        );
        return null;
      }

      console.log(`Sending report to: ${recipients.join(", ")}`);

      // Generate Excel file
      // Generate both Excel files (monthly detailed and annual accumulated)
      const exportResult = await generateMonthlyAndAnnualReports(
        startDate,
        endDate,
        null, // null = all workers
      );

      if (!exportResult || !exportResult.success) {
        throw new Error("Failed to generate Excel reports");
      }

      console.log(
        `Excel files generated:\n` +
          `- Monthly: ${exportResult.monthly.fileName}\n` +
          `- Annual: ${exportResult.annual.fileName}\n` +
          `(${exportResult.recordCount} records, ${exportResult.workerCount} workers)`,
      );

      // Calculate summary statistics
      const startTimestamp =
        admin.firestore.Timestamp.fromDate(firstDayPrevMonth);
      const endTimestamp = admin.firestore.Timestamp.fromDate(lastDayPrevMonth);

      const snapshot = await admin
        .firestore()
        .collection("timeEntries")
        .where("date", ">=", startTimestamp)
        .where("date", "<=", endTimestamp)
        .get();

      // Calculate total hours per worker
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

      // Format summary
      const monthName = firstDayPrevMonth.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
      const dateRange = `${firstDayPrevMonth.toLocaleDateString("es-ES")} - ${lastDayPrevMonth.toLocaleDateString("es-ES")}`;

      let summaryHtml = "<h3>📊 Resumen de Horas Trabajadas</h3><ul>";
      Object.keys(workerStats)
        .sort()
        .forEach((workerName) => {
          const stats = workerStats[workerName];
          const hours = Math.floor(stats.totalMinutes / 60);
          const minutes = stats.totalMinutes % 60;
          summaryHtml += `<li><strong>${workerName}:</strong> ${hours}h ${minutes}m`;
          if (stats.days > 0) {
            summaryHtml += ` (${stats.days} días)`;
          }
          if (stats.pending > 0) {
            summaryHtml += ` <span style="color: #ff9800;">⚠️ ${stats.pending} pendiente(s)</span>`;
          }
          summaryHtml += "</li>";
        });
      summaryHtml += "</ul>";

      // Add general statistics
      // Email sending disabled
      console.log(
        `Monthly report generated (email disabled). ${totalRecords} records, ${recipients.length} recipient(s) skipped.`,
      );

      return {
        success: true,
        recipients: recipients,
        recordCount: totalRecords,
        period: { startDate, endDate },
      };
    } catch (error) {
      console.error("❌ Error in scheduled monthly report:", error);
      // Don't throw - let it fail gracefully and retry next month
      return {
        success: false,
        error: error.message,
      };
    }
  });
