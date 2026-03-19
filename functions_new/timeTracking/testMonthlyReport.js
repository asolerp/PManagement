const admin = require("firebase-admin");
const { REGION } = require("../utils");
const {
  generateMonthlyAndAnnualReports,
} = require("./exportMonthlyAndAnnualReports");
const { onRequest } = require("firebase-functions/v2/https");

exports.testMonthlyReport = onRequest(
  { region: REGION, timeoutSeconds: 540, memory: "1GiB" },
  async (req, res) => {
    try {
      console.log("🧪 Testing monthly report...");

      const month = parseInt(req.query.month || req.body?.month);
      const year = parseInt(req.query.year || req.body?.year);
      const startDateParam = req.query.startDate || req.body?.startDate;
      const endDateParam = req.query.endDate || req.body?.endDate;

      let startDate, endDate;

      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using custom date range: ${startDate.toISOString()} to ${endDate.toISOString()}`,
        );
      } else if (month && year) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        startDate = firstDay;
        endDate = lastDay;
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using month ${month}/${year}: ${startDate.toISOString()} to ${endDate.toISOString()}`,
        );
      } else {
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
        startDate = firstDayPrevMonth;
        endDate = lastDayPrevMonth;
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using previous month (default): ${startDate.toISOString()} to ${endDate.toISOString()}`,
        );
      }

      const configRecipients = process.env.MONTHLY_REPORT_RECIPIENTS;

      let recipients = [];
      if (configRecipients) {
        recipients = configRecipients.split(",").map((email) => email.trim());
      } else {
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
        return res.status(400).json({
          success: false,
          error:
            "No recipients configured. Please set MONTHLY_REPORT_RECIPIENTS",
        });
      }

      console.log(`Sending report to: ${recipients.join(", ")}`);

      const exportResult = await generateMonthlyAndAnnualReports(
        startDate.toISOString(),
        endDate.toISOString(),
        null,
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

      const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

      const snapshot = await admin
        .firestore()
        .collection("timeEntries")
        .where("date", ">=", startTimestamp)
        .where("date", "<=", endTimestamp)
        .get();

      let totalRecords = 0;
      let completedRecords = 0;
      let pendingRecords = 0;

      snapshot.forEach((doc) => {
        const entrance = doc.data();
        totalRecords++;
        if (entrance.exitDate) {
          completedRecords++;
        } else {
          pendingRecords++;
        }
      });

      const monthName = startDate.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });

      res.status(200).json({
        success: true,
        message: "Test monthly report executed successfully",
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthName: monthName,
        },
        stats: {
          totalRecords,
          completedRecords,
          pendingRecords,
        },
        recipients: recipients,
        files: {
          monthly: exportResult.monthly.fileName,
          annual: exportResult.annual.fileName,
        },
        downloadUrls: {
          monthly: exportResult.monthly.downloadUrl,
          annual: exportResult.annual.downloadUrl,
        },
      });
    } catch (error) {
      console.error("Error testing monthly report:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  },
);
