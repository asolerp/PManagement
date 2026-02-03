const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { REGION } = require('../utils');

/**
 * Cloud Function to send time tracking report via email
 * Accepts: startDate, endDate, workerId (optional), recipients (array of emails)
 * Generates Excel report and sends it via email
 */
exports.sendTimeTrackingEmail = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to send time tracking reports.'
        );
      }

      const { startDate, endDate, workerId, recipients } = data;

      if (!startDate || !endDate || !recipients || recipients.length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'startDate, endDate, and recipients are required.'
        );
      }

      // Import the export function
      const {
        exportTimeTrackingToExcel
      } = require('./exportTimeTrackingToExcel');

      // Generate Excel file
      const exportResult = await exportTimeTrackingToExcel.run(
        { startDate, endDate, workerId },
        context
      );

      if (!exportResult.success) {
        throw new functions.https.HttpsError(
          'internal',
          'Failed to generate Excel report.'
        );
      }

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Format date range for email
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const dateRange = `${startDateObj.toLocaleDateString('es-ES')} - ${endDateObj.toLocaleDateString('es-ES')}`;

      // Calculate summary statistics
      const startTimestamp = admin.firestore.Timestamp.fromDate(startDateObj);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endDateObj);

      let query = admin
        .firestore()
        .collection('entrances')
        .where('date', '>=', startTimestamp)
        .where('date', '<=', endTimestamp);

      if (workerId) {
        query = query.where('worker.id', '==', workerId);
      }

      const snapshot = await query.get();

      // Calculate total hours per worker
      const workerStats = {};
      snapshot.forEach(doc => {
        const entrance = doc.data();
        const workerName =
          entrance.worker?.name || entrance.worker?.email || 'Desconocido';

        if (!workerStats[workerName]) {
          workerStats[workerName] = { totalMinutes: 0, days: 0 };
        }

        if (entrance.exitDate) {
          const entryMs =
            entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
          const exitMs =
            entrance.exitDate.seconds * 1000 +
            entrance.exitDate.nanoseconds / 1000000;
          const diffMinutes = Math.floor((exitMs - entryMs) / (1000 * 60));
          workerStats[workerName].totalMinutes += diffMinutes;
          workerStats[workerName].days += 1;
        }
      });

      // Format summary
      let summaryHtml = '<h3>Resumen de Horas Trabajadas</h3><ul>';
      Object.keys(workerStats).forEach(workerName => {
        const stats = workerStats[workerName];
        const hours = Math.floor(stats.totalMinutes / 60);
        const minutes = stats.totalMinutes % 60;
        summaryHtml += `<li><strong>${workerName}:</strong> ${hours}h ${minutes}m (${stats.days} días)</li>`;
      });
      summaryHtml += '</ul>';

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(', '),
        subject: `Registro de Jornada Laboral - ${dateRange}`,
        html: `
          <h2>Registro de Jornada Laboral</h2>
          <p>Adjunto encontrará el registro de jornada laboral para el período: <strong>${dateRange}</strong></p>
          ${summaryHtml}
          <p>El archivo Excel adjunto contiene el detalle completo de todas las entradas y salidas registradas, incluyendo:</p>
          <ul>
            <li>Nombre del trabajador</li>
            <li>Fecha y hora de entrada/salida</li>
            <li>Ubicación GPS de entrada/salida</li>
            <li>Total de horas trabajadas</li>
            <li>Propiedad/Casa</li>
            <li>Enlaces a fotos de entrada/salida</li>
          </ul>
          <p><em>Este registro cumple con los requisitos del Real Decreto-ley 8/2019 sobre registro de jornada laboral.</em></p>
          <br>
          <p>Puede descargar el archivo Excel desde el siguiente enlace:</p>
          <p><a href="${exportResult.downloadUrl}">Descargar Registro (${exportResult.fileName})</a></p>
          <p><small>El enlace de descarga es válido por 1 hora.</small></p>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: 'Email sent successfully',
        recipients: recipients,
        recordCount: exportResult.recordCount
      };
    } catch (error) {
      console.error('Error sending time tracking email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send time tracking email.',
        error.message
      );
    }
  });
