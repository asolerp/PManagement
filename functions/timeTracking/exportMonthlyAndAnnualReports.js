const admin = require('firebase-admin');
const ExcelJS = require('exceljs');

/**
 * Generate two Excel reports:
 * 1. Monthly detailed report with daily consolidated entries
 * 2. Annual accumulated report by months
 */
async function generateMonthlyAndAnnualReports(
  startDate,
  endDate,
  workerId = null
) {
  try {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Convert to Firestore Timestamps
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDateObj);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDateObj);

    // Build query for MONTHLY report (uses provided date range)
    let monthlyQuery = admin
      .firestore()
      .collection('entrances')
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'asc');

    if (workerId) {
      monthlyQuery = monthlyQuery.where('worker.id', '==', workerId);
    }

    const monthlySnapshot = await monthlyQuery.get();

    // Build query for ANNUAL report (always uses full year)
    const year = startDateObj.getFullYear();
    const yearStart = new Date(year, 0, 1); // January 1st
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st

    const yearStartTimestamp = admin.firestore.Timestamp.fromDate(yearStart);
    const yearEndTimestamp = admin.firestore.Timestamp.fromDate(yearEnd);

    let annualQuery = admin
      .firestore()
      .collection('entrances')
      .where('date', '>=', yearStartTimestamp)
      .where('date', '<=', yearEndTimestamp)
      .orderBy('date', 'asc');

    if (workerId) {
      annualQuery = annualQuery.where('worker.id', '==', workerId);
    }

    const annualSnapshot = await annualQuery.get();

    if (monthlySnapshot.empty && annualSnapshot.empty) {
      console.log('No records found for the period');
      return null;
    }

    // ========== PROCESS DATA FOR MONTHLY REPORT ==========

    // Group by worker and date (for monthly report)
    const workerData = {};

    monthlySnapshot.forEach(doc => {
      const entrance = doc.data();
      const workerName =
        entrance.worker?.name ||
        `${entrance.worker?.firstName || ''} ${entrance.worker?.secondName || ''}`.trim() ||
        entrance.worker?.email ||
        'Desconocido';
      const workerId = entrance.worker?.id || 'unknown';

      // Get date (just the date, no time)
      const entryDate = new Date(
        entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
      );
      const dateKey = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Initialize worker data structure
      if (!workerData[workerId]) {
        workerData[workerId] = {
          name: workerName,
          days: {}
        };
      }

      if (!workerData[workerId].days[dateKey]) {
        workerData[workerId].days[dateKey] = {
          entries: [],
          date: entryDate
        };
      }

      // Store entry
      workerData[workerId].days[dateKey].entries.push({
        entryTime: entryDate,
        exitTime: entrance.exitDate
          ? new Date(
              entrance.exitDate.seconds * 1000 +
                entrance.exitDate.nanoseconds / 1000000
            )
          : null,
        location: entrance.location,
        exitLocation: entrance.exitLocation,
        house: entrance.house?.houseName || ''
      });
    });

    // ========== PROCESS DATA FOR ANNUAL REPORT ==========

    // Group by worker and month (for annual report - uses full year data)
    const workerAnnualData = {};

    annualSnapshot.forEach(doc => {
      const entrance = doc.data();
      const workerName =
        entrance.worker?.name ||
        `${entrance.worker?.firstName || ''} ${entrance.worker?.secondName || ''}`.trim() ||
        entrance.worker?.email ||
        'Desconocido';
      const workerId = entrance.worker?.id || 'unknown';

      // Get month key for grouping
      const entryDate = new Date(
        entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
      );
      const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

      // Initialize worker annual data structure
      if (!workerAnnualData[workerId]) {
        workerAnnualData[workerId] = {
          name: workerName,
          months: {}
        };
      }

      if (!workerAnnualData[workerId].months[monthKey]) {
        workerAnnualData[workerId].months[monthKey] = {
          totalMinutes: 0
        };
      }

      // Calculate hours for annual report (grouped by month)
      if (entrance.exitDate) {
        const entryMs =
          entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
        const exitMs =
          entrance.exitDate.seconds * 1000 +
          entrance.exitDate.nanoseconds / 1000000;
        const diffMinutes = Math.floor((exitMs - entryMs) / (1000 * 60));
        workerAnnualData[workerId].months[monthKey].totalMinutes += diffMinutes;
      }
    });

    // ========== GENERATE EXCEL 1: MONTHLY DETAILED REPORT ==========

    const monthlyWorkbook = new ExcelJS.Workbook();
    const monthName = startDateObj.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });

    // Create a single sheet with all workers
    const monthlyWorksheet = monthlyWorkbook.addWorksheet('Registro Mensual');

    // Title
    monthlyWorksheet.mergeCells('A1:E1');
    monthlyWorksheet.getCell('A1').value = `REGISTRO DE JORNADA MENSUAL`;
    monthlyWorksheet.getCell('A1').font = { bold: true, size: 14 };
    monthlyWorksheet.getCell('A1').alignment = { horizontal: 'center' };
    monthlyWorksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' }
    };
    monthlyWorksheet.getCell('A1').font = {
      ...monthlyWorksheet.getCell('A1').font,
      color: { argb: 'FFFFFFFF' }
    };

    // Period
    monthlyWorksheet.mergeCells('A2:E2');
    monthlyWorksheet.getCell('A2').value = `Período: ${monthName}`;
    monthlyWorksheet.getCell('A2').alignment = { horizontal: 'center' };
    monthlyWorksheet.getCell('A2').font = { italic: true };

    // Headers
    monthlyWorksheet.addRow([]); // Empty row
    const monthlyHeaderRow = monthlyWorksheet.addRow([
      'Fecha',
      'Trabajador',
      'Hora Entrada',
      'Hora Salida',
      'Total Horas'
    ]);

    monthlyHeaderRow.font = { bold: true };
    monthlyHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    monthlyHeaderRow.alignment = { horizontal: 'center' };

    // Set column widths
    monthlyWorksheet.getColumn(1).width = 15; // Fecha
    monthlyWorksheet.getColumn(2).width = 30; // Trabajador
    monthlyWorksheet.getColumn(3).width = 15; // Hora Entrada
    monthlyWorksheet.getColumn(4).width = 15; // Hora Salida
    monthlyWorksheet.getColumn(5).width = 15; // Total Horas

    // Process all workers and days into a single flat list
    const allRows = [];

    Object.keys(workerData)
      .sort((a, b) => workerData[a].name.localeCompare(workerData[b].name))
      .forEach(workerId => {
        const worker = workerData[workerId];
        const sortedDates = Object.keys(worker.days).sort();

        sortedDates.forEach(dateKey => {
          const dayData = worker.days[dateKey];

          // Sort entries by time to get first entry
          dayData.entries.sort((a, b) => a.entryTime - b.entryTime);

          // Get first entry time (earliest of the day)
          const firstEntry = dayData.entries[0];
          const firstEntryTime = firstEntry.entryTime;

          // Get last exit time (latest exit of all entries that have an exit)
          let lastExitTime = null;
          dayData.entries.forEach(entry => {
            if (entry.exitTime) {
              if (!lastExitTime || entry.exitTime > lastExitTime) {
                lastExitTime = entry.exitTime;
              }
            }
          });

          // Calculate total hours for the day
          let totalHoursStr = '-';
          if (lastExitTime) {
            const diffMs = lastExitTime - firstEntryTime;
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            totalHoursStr = `${hours}h ${minutes}m`;
          }

          // Format times
          const entryTimeStr = firstEntryTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });

          const exitTimeStr = lastExitTime
            ? lastExitTime.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : '-';

          // Format date
          const dateStr = dayData.date.toLocaleDateString('es-ES');

          // Add row: Fecha, Trabajador, Hora Entrada, Hora Salida, Total Horas
          allRows.push({
            workerName: worker.name,
            date: dayData.date,
            dateStr: dateStr,
            entryTime: entryTimeStr,
            exitTime: exitTimeStr,
            totalHours: totalHoursStr
          });
        });
      });

    // Sort rows by date first, then by worker name
    allRows.sort((a, b) => {
      const dateDiff = a.date - b.date;
      if (dateDiff !== 0) return dateDiff;
      return a.workerName.localeCompare(b.workerName);
    });

    // Add all rows to worksheet
    allRows.forEach(row => {
      const excelRow = monthlyWorksheet.addRow([
        row.dateStr,
        row.workerName,
        row.entryTime,
        row.exitTime,
        row.totalHours
      ]);

      // Alternate row colors
      if (excelRow.number % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }

      // Weekend highlight
      const dayNum = row.date.getDay();
      if (dayNum === 0 || dayNum === 6) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEAA7' }
        };
      }

      // Center align date and time columns
      excelRow.getCell(1).alignment = { horizontal: 'center' }; // Fecha
      excelRow.getCell(3).alignment = { horizontal: 'center' }; // Hora Entrada
      excelRow.getCell(4).alignment = { horizontal: 'center' }; // Hora Salida
      excelRow.getCell(5).alignment = { horizontal: 'center' }; // Total Horas
    });

    // ========== GENERATE EXCEL 2: ANNUAL ACCUMULATED REPORT ==========

    const annualWorkbook = new ExcelJS.Workbook();
    const annualWorksheet = annualWorkbook.addWorksheet('Acumulado Anual');

    // Title
    annualWorksheet.mergeCells('A1:N1');
    annualWorksheet.getCell('A1').value =
      'REGISTRO ACUMULADO ANUAL POR TRABAJADOR';
    annualWorksheet.getCell('A1').font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' }
    };
    annualWorksheet.getCell('A1').alignment = { horizontal: 'center' };
    annualWorksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' }
    };

    // Year
    annualWorksheet.mergeCells('A2:N2');
    annualWorksheet.getCell('A2').value = `Año ${year}`;
    annualWorksheet.getCell('A2').alignment = { horizontal: 'center' };
    annualWorksheet.getCell('A2').font = { italic: true, size: 12 };

    // Headers
    annualWorksheet.addRow([]); // Empty row
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];

    const annualHeaderRow = annualWorksheet.addRow([
      'Trabajador',
      ...months,
      'TOTAL ANUAL'
    ]);
    annualHeaderRow.font = { bold: true };
    annualHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    annualHeaderRow.alignment = { horizontal: 'center' };

    // Set column widths
    annualWorksheet.getColumn(1).width = 25; // Trabajador
    for (let i = 2; i <= 13; i++) {
      annualWorksheet.getColumn(i).width = 10; // Months
    }
    annualWorksheet.getColumn(14).width = 15; // Total

    // Add worker rows
    Object.keys(workerAnnualData)
      .sort((a, b) =>
        workerAnnualData[a].name.localeCompare(workerAnnualData[b].name)
      )
      .forEach(workerId => {
        const worker = workerAnnualData[workerId];
        const rowData = [worker.name];
        let annualTotal = 0;

        // Add data for each month
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          const monthData = worker.months[monthKey];

          if (monthData && monthData.totalMinutes > 0) {
            const hours = Math.floor(monthData.totalMinutes / 60);
            const minutes = monthData.totalMinutes % 60;
            rowData.push(`${hours}h ${minutes}m`);
            annualTotal += monthData.totalMinutes;
          } else {
            rowData.push('-');
          }
        }

        // Add annual total
        const totalHours = Math.floor(annualTotal / 60);
        const totalMinutes = annualTotal % 60;
        rowData.push(`${totalHours}h ${totalMinutes}m`);

        const row = annualWorksheet.addRow(rowData);

        // Alternate row colors
        if (annualWorksheet.lastRow.number % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }

        // Center align all cells except first
        for (let i = 2; i <= 14; i++) {
          row.getCell(i).alignment = { horizontal: 'center' };
        }
      });

    // ========== SAVE TO FIREBASE STORAGE ==========

    const bucket = admin.storage().bucket();
    const timestamp = Date.now();

    // Save monthly report
    const monthlyBuffer = await monthlyWorkbook.xlsx.writeBuffer();
    const monthlyFileName = `registro-mensual-${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${timestamp}.xlsx`;
    const monthlyFile = bucket.file(`exports/${monthlyFileName}`);

    await monthlyFile.save(monthlyBuffer, {
      metadata: {
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

    // Save annual report
    const annualBuffer = await annualWorkbook.xlsx.writeBuffer();
    const annualFileName = `registro-anual-${year}-${timestamp}.xlsx`;
    const annualFile = bucket.file(`exports/${annualFileName}`);

    await annualFile.save(annualBuffer, {
      metadata: {
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

    // Generate signed URLs (valid for 1 hour)
    const [monthlyUrl] = await monthlyFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });

    const [annualUrl] = await annualFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });

    return {
      success: true,
      monthly: {
        fileName: monthlyFileName,
        downloadUrl: monthlyUrl
      },
      annual: {
        fileName: annualFileName,
        downloadUrl: annualUrl
      },
      recordCount: monthlySnapshot.size,
      workerCount: Object.keys(workerData).length
    };
  } catch (error) {
    console.error('Error generating reports:', error);
    throw error;
  }
}

module.exports = {
  generateMonthlyAndAnnualReports
};
