const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ExcelJS = require('exceljs');
const { REGION } = require('../utils');

/**
 * Cloud Function to export time tracking data to Excel
 * Accepts: startDate, endDate, workerId (optional)
 * Returns: Download URL for the Excel file
 */
exports.exportTimeTrackingToExcel = functions
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
          'User must be authenticated to export time tracking data.'
        );
      }

      const { startDate, endDate, workerId } = data;

      if (!startDate || !endDate) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'startDate and endDate are required.'
        );
      }

      // Convert dates to Firestore Timestamps
      const startTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(startDate)
      );
      const endTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(endDate)
      );

      // Build query
      let query = admin
        .firestore()
        .collection('entrances')
        .where('date', '>=', startTimestamp)
        .where('date', '<=', endTimestamp)
        .orderBy('date', 'desc');

      // Filter by worker if specified
      if (workerId) {
        query = query.where('worker.id', '==', workerId);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        throw new functions.https.HttpsError(
          'not-found',
          'No time tracking records found for the specified period.'
        );
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registro de Jornada');

      // Define columns
      worksheet.columns = [
        { header: 'Trabajador', key: 'worker', width: 25 },
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Hora Entrada', key: 'entryTime', width: 15 },
        { header: 'Ubicación Entrada', key: 'entryLocation', width: 30 },
        { header: 'Hora Salida', key: 'exitTime', width: 15 },
        { header: 'Ubicación Salida', key: 'exitLocation', width: 30 },
        { header: 'Total Horas', key: 'totalHours', width: 15 },
        { header: 'Casa/Propiedad', key: 'house', width: 25 },
        { header: 'Foto Entrada', key: 'entryPhoto', width: 50 },
        { header: 'Foto Salida', key: 'exitPhoto', width: 50 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      const records = [];
      snapshot.forEach(doc => {
        const entrance = doc.data();

        // Calculate total hours if exit exists
        let totalHours = '';
        if (entrance.exitDate) {
          const entryMs =
            entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
          const exitMs =
            entrance.exitDate.seconds * 1000 +
            entrance.exitDate.nanoseconds / 1000000;
          const diffMs = exitMs - entryMs;
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          totalHours = `${hours}h ${minutes}m`;
        }

        // Format date
        const entryDate = new Date(
          entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
        );
        const dateStr = entryDate.toLocaleDateString('es-ES');
        const entryTimeStr = entryDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });

        let exitTimeStr = '';
        if (entrance.exitDate) {
          const exitDate = new Date(
            entrance.exitDate.seconds * 1000 +
              entrance.exitDate.nanoseconds / 1000000
          );
          exitTimeStr = exitDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        // Format locations
        const entryLocation = entrance.location
          ? `${entrance.location.latitude.toFixed(6)}, ${entrance.location.longitude.toFixed(6)}`
          : '';
        const exitLocation = entrance.exitLocation
          ? `${entrance.exitLocation.latitude.toFixed(6)}, ${entrance.exitLocation.longitude.toFixed(6)}`
          : '';

        // Get photo URLs from storage
        const entryPhotoUrl = entrance.images?.[0]?.url || '';
        const exitPhotoUrl = entrance.images?.[1]?.url || '';

        records.push({
          worker: entrance.worker?.name || entrance.worker?.email || '',
          date: dateStr,
          entryTime: entryTimeStr,
          entryLocation: entryLocation,
          exitTime: exitTimeStr,
          exitLocation: exitLocation,
          totalHours: totalHours,
          house: entrance.house?.houseName || '',
          entryPhoto: entryPhotoUrl,
          exitPhoto: exitPhotoUrl
        });
      });

      worksheet.addRows(records);

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Upload to Firebase Storage
      const bucket = admin.storage().bucket();
      const fileName = `time-tracking-${Date.now()}.xlsx`;
      const file = bucket.file(`exports/${fileName}`);

      await file.save(buffer, {
        metadata: {
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Generate signed URL (valid for 1 hour)
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000 // 1 hour
      });

      return {
        success: true,
        downloadUrl: url,
        fileName: fileName,
        recordCount: records.length
      };
    } catch (error) {
      console.error('Error exporting time tracking data:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to export time tracking data.',
        error.message
      );
    }
  });
