const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const {
  generateMonthlyAndAnnualReports
} = require('./exportMonthlyAndAnnualReports');
const { createTransporter } = require('../utils/email/config');

/**
 * Scheduled function to send monthly time tracking report
 * Runs automatically on the 1st day of each month at 9:00 AM (Europe/Madrid)
 * Sends report for the previous month to configured recipients
 */
exports.scheduledMonthlyReport = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .pubsub.schedule('0 9 1 * *') // Día 1 de cada mes a las 9:00 AM
  .timeZone('Europe/Madrid')
  .onRun(async () => {
    try {
      console.log('Starting scheduled monthly time tracking report...');

      // Calculate previous month date range
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
        recipients = configRecipients.split(',').map(email => email.trim());
      }
      // Option 2: From environment variables (process.env)
      else if (process.env.MONTHLY_REPORT_RECIPIENTS) {
        recipients = process.env.MONTHLY_REPORT_RECIPIENTS.split(',').map(
          email => email.trim()
        );
      }
      // Option 3: From Firestore settings collection
      else {
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
        console.warn(
          'No recipients configured for monthly report. Skipping...'
        );
        return null;
      }

      console.log(`Sending report to: ${recipients.join(', ')}`);

      // Generate Excel file
      // Generate both Excel files (monthly detailed and annual accumulated)
      const exportResult = await generateMonthlyAndAnnualReports(
        startDate,
        endDate,
        null // null = all workers
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
      const startTimestamp =
        admin.firestore.Timestamp.fromDate(firstDayPrevMonth);
      const endTimestamp = admin.firestore.Timestamp.fromDate(lastDayPrevMonth);

      const snapshot = await admin
        .firestore()
        .collection('entrances')
        .where('date', '>=', startTimestamp)
        .where('date', '<=', endTimestamp)
        .get();

      // Calculate total hours per worker
      const workerStats = {};
      let totalRecords = 0;
      let completedRecords = 0;
      let pendingRecords = 0;

      snapshot.forEach(doc => {
        const entrance = doc.data();
        totalRecords++;

        const workerName =
          entrance.worker?.name ||
          `${entrance.worker?.firstName || ''} ${entrance.worker?.secondName || ''}`.trim() ||
          entrance.worker?.email ||
          'Desconocido';

        if (!workerStats[workerName]) {
          workerStats[workerName] = {
            totalMinutes: 0,
            days: 0,
            pending: 0
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
      const monthName = firstDayPrevMonth.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
      const dateRange = `${firstDayPrevMonth.toLocaleDateString('es-ES')} - ${lastDayPrevMonth.toLocaleDateString('es-ES')}`;

      let summaryHtml = '<h3>📊 Resumen de Horas Trabajadas</h3><ul>';
      Object.keys(workerStats)
        .sort()
        .forEach(workerName => {
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
          summaryHtml += '</li>';
        });
      summaryHtml += '</ul>';

      // Add general statistics
      summaryHtml += `
        <h3>📈 Estadísticas Generales</h3>
        <ul>
          <li><strong>Total Registros:</strong> ${totalRecords}</li>
          <li><strong>Registros Completos:</strong> ${completedRecords}</li>
          <li><strong>Registros Pendientes:</strong> ${pendingRecords}</li>
        </ul>
      `;

      // Configure nodemailer using the same transporter as other email functions
      const transporter = await createTransporter();

      // Email content
      const mailOptions = {
        from: process.env.EMAIL,
        to: recipients.join(', '),
        subject: `📅 Registro de Jornada Laboral - ${monthName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">📋 Registro de Jornada Laboral Mensual</h2>
            <p>Se ha generado automáticamente el registro de jornada laboral para el período:</p>
            <p style="font-size: 18px; background-color: #f5f5f5; padding: 10px; border-left: 4px solid #2196F3;">
              <strong>${dateRange}</strong>
            </p>
            
            ${summaryHtml}
            
            <h3>📄 Documentos Adjuntos</h3>
            <p>Se han generado <strong>dos archivos Excel</strong> con diferentes niveles de detalle:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="margin-top: 0; color: #2196F3;">📊 Informe Mensual Detallado</h4>
              <p style="margin: 5px 0;">Incluye para cada trabajador:</p>
              <ul style="margin: 5px 0;">
                <li>Registro diario con fecha y día de la semana</li>
                <li>Hora de entrada (primera del día) y salida (última del día)</li>
                <li>Total de horas trabajadas por día</li>
                <li>Propiedad/Casa asignada</li>
                <li><strong>Total acumulado mensual por trabajador</strong></li>
              </ul>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="margin-top: 0; color: #4CAF50;">📈 Informe Anual Acumulado</h4>
              <p style="margin: 5px 0;">Resumen consolidado que incluye:</p>
              <ul style="margin: 5px 0;">
                <li>Total de horas por trabajador para cada mes</li>
                <li>Comparativa mensual en una sola vista</li>
                <li><strong>Total anual acumulado por trabajador</strong></li>
                <li>Visión global del año completo</li>
              </ul>
            </div>
            
            ${
              pendingRecords > 0
                ? `
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #e65100;">
                  <strong>⚠️ Atención:</strong> Hay ${pendingRecords} registro(s) sin salida registrada que requieren atención.
                </p>
              </div>
            `
                : ''
            }
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1565c0;">
                <strong>ℹ️ Nota Legal:</strong> Este registro cumple con los requisitos del Real Decreto-ley 8/2019 sobre registro de jornada laboral.
              </p>
            </div>
            
            <h3>⬇️ Descargar Informes</h3>
            <p>Puede descargar ambos archivos Excel desde los siguientes enlaces:</p>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; text-align: center;">
                  <a href="${exportResult.monthly.downloadUrl}" 
                     style="background-color: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    📅 Informe Mensual Detallado
                  </a>
                  <p style="font-size: 11px; color: #666; margin: 8px 0 0 0;">
                    ${exportResult.monthly.fileName}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; text-align: center;">
                  <a href="${exportResult.annual.downloadUrl}" 
                     style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    📊 Informe Anual Acumulado
                  </a>
                  <p style="font-size: 11px; color: #666; margin: 8px 0 0 0;">
                    ${exportResult.annual.fileName}
                  </p>
                </td>
              </tr>
            </table>
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              <em>⏰ Los enlaces de descarga son válidos por 1 hora.</em>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Este correo ha sido generado automáticamente el primer día del mes.<br>
              Port Management - Sistema de Gestión
            </p>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      console.log(
        `✅ Monthly report sent successfully to ${recipients.length} recipient(s)`
      );

      return {
        success: true,
        recipients: recipients,
        recordCount: totalRecords,
        period: { startDate, endDate }
      };
    } catch (error) {
      console.error('❌ Error in scheduled monthly report:', error);
      // Don't throw - let it fail gracefully and retry next month
      return {
        success: false,
        error: error.message
      };
    }
  });
