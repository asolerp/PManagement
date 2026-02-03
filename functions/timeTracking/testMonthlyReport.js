const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const {
  generateMonthlyAndAnnualReports
} = require('./exportMonthlyAndAnnualReports');
const { createTransporter } = require('../utils/email/config');

/**
 * Manual test function for monthly report
 * Allows testing with custom month/year selection
 *
 * Usage examples:
 *
 * 1. Test previous month (default):
 *    GET https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/testMonthlyReport
 *
 *    https://europe-west1-port-management-9bd53.cloudfunctions.net/testMonthlyReport
 *
 * 2. Test specific month:
 *    GET https://europe-west1-port-management-9bd53.cloudfunctions.net/testMonthlyReport?month=8&year=2024
 *
 * 3. Test with custom date range:
 *    GET https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/testMonthlyReport?startDate=2024-11-01&endDate=2024-11-30
 *
 * 4. POST with JSON body:
 *    POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/testMonthlyReport
 *    Body: { "month": 11, "year": 2024 }
 *    or
 *    Body: { "startDate": "2024-11-01", "endDate": "2024-11-30" }
 */
exports.testMonthlyReport = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log('🧪 Testing monthly report...');

      // Get parameters from query string or body
      const month = parseInt(req.query.month || req.body?.month);
      const year = parseInt(req.query.year || req.body?.year);
      const startDateParam = req.query.startDate || req.body?.startDate;
      const endDateParam = req.query.endDate || req.body?.endDate;

      let startDate, endDate;

      // Option 1: Custom date range
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using custom date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
        );
      }
      // Option 2: Specific month/year
      else if (month && year) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        startDate = firstDay;
        endDate = lastDay;
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using month ${month}/${year}: ${startDate.toISOString()} to ${endDate.toISOString()}`
        );
      }
      // Option 3: Previous month (default)
      else {
        const today = new Date();
        const firstDayPrevMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastDayPrevMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        startDate = firstDayPrevMonth;
        endDate = lastDayPrevMonth;
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        console.log(
          `Using previous month (default): ${startDate.toISOString()} to ${endDate.toISOString()}`
        );
      }

      // Get recipients from config
      const configRecipients =
        functions.config().monthly_report?.recipients ||
        process.env.MONTHLY_REPORT_RECIPIENTS;

      let recipients = [];
      if (configRecipients) {
        recipients = configRecipients.split(',').map(email => email.trim());
      } else {
        // Try Firestore as fallback
        const settingsDoc = await admin
          .firestore()
          .collection('settings')
          .doc('timeTracking')
          .get();

        if (settingsDoc.exists) {
          recipients = settingsDoc.data().monthlyReportRecipients || [];
        }
      }

      if (!recipients || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            'No recipients configured. Please set monthly_report.recipients'
        });
      }

      console.log(`Sending report to: ${recipients.join(', ')}`);

      // Generate Excel files
      const exportResult = await generateMonthlyAndAnnualReports(
        startDate.toISOString(),
        endDate.toISOString(),
        null // all workers
      );

      if (!exportResult || !exportResult.success) {
        throw new Error('Failed to generate Excel reports');
      }

      console.log(
        `Excel files generated:\n` +
          `- Monthly: ${exportResult.monthly.fileName}\n` +
          `- Annual: ${exportResult.annual.fileName}\n` +
          `(${exportResult.recordCount} records, ${exportResult.workerCount} workers)`
      );

      // Calculate summary statistics
      const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

      const snapshot = await admin
        .firestore()
        .collection('entrances')
        .where('date', '>=', startTimestamp)
        .where('date', '<=', endTimestamp)
        .get();

      let totalRecords = 0;
      let completedRecords = 0;
      let pendingRecords = 0;

      snapshot.forEach(doc => {
        const entrance = doc.data();
        totalRecords++;
        if (entrance.exitDate) {
          completedRecords++;
        } else {
          pendingRecords++;
        }
      });

      // Format month name for email
      const monthName = startDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
      const dateRange = `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`;

      // Send email
      const transporter = await createTransporter();

      const mailOptions = {
        from: process.env.EMAIL,
        to: recipients.join(', '),
        subject: `🧪 TEST - Registro de Jornada Laboral - ${monthName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ff9800; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="margin: 0;">🧪 REPORTE DE PRUEBA</h2>
              <p style="margin: 5px 0 0 0;">Este es un correo de prueba generado manualmente</p>
            </div>
            <h2 style="color: #2196F3;">📋 Registro de Jornada Laboral Mensual</h2>
            <p>Período: <strong>${dateRange}</strong></p>
            <p><strong>Total Registros:</strong> ${totalRecords}</p>
            <p><strong>Registros Completos:</strong> ${completedRecords}</p>
            <p><strong>Registros Pendientes:</strong> ${pendingRecords}</p>
            <h3>⬇️ Descargar Informes</h3>
            <p>
              <a href="${exportResult.monthly.downloadUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">
                📅 Informe Mensual
              </a>
              <a href="${exportResult.annual.downloadUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">
                📊 Informe Anual
              </a>
            </p>
            <p style="font-size: 12px; color: #666;">
              <em>⏰ Los enlaces de descarga son válidos por 1 hora.</em>
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: 'Test monthly report executed successfully',
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthName: monthName
        },
        stats: {
          totalRecords,
          completedRecords,
          pendingRecords
        },
        recipients: recipients,
        files: {
          monthly: exportResult.monthly.fileName,
          annual: exportResult.annual.fileName
        }
      });
    } catch (error) {
      console.error('Error testing monthly report:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  });
