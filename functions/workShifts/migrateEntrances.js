/**
 * Migration script to convert existing entrances to workShifts
 * Run once to populate historical data
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const { getDateString, calculateMinutes, generateShiftId, isAdmin } = require('./utils');

/**
 * Migrate existing entrances to workShifts collection
 * This is a one-time operation triggered by an admin
 */
exports.migrateEntrancesToWorkShifts = functions
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
          'User must be authenticated.'
        );
      }

      const db = admin.firestore();

      // Verify admin role
      const adminCheck = await isAdmin(db, context.auth.uid);
      if (!adminCheck) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only administrators can run migrations.'
        );
      }

      const { dryRun = true, startDate, endDate } = data;

      console.log(`Starting migration. DryRun: ${dryRun}`);

      // Build query for entrances
      let query = db.collection('entrances').orderBy('date', 'asc');

      if (startDate) {
        const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate));
        query = query.where('date', '>=', startTimestamp);
      }

      if (endDate) {
        const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate));
        query = query.where('date', '<=', endTimestamp);
      }

      const entrancesSnapshot = await query.get();

      console.log(`Found ${entrancesSnapshot.size} entrances to process`);

      // Group entrances by worker and date
      const shiftGroups = new Map();

      entrancesSnapshot.forEach(doc => {
        const entrance = doc.data();
        const entranceId = doc.id;

        if (!entrance.worker?.id || !entrance.date) {
          console.log(`Skipping invalid entrance: ${entranceId}`);
          return;
        }

        const workerId = entrance.worker.id;
        const dateString = getDateString(entrance.date);
        const shiftKey = generateShiftId(workerId, dateString);

        if (!shiftGroups.has(shiftKey)) {
          shiftGroups.set(shiftKey, {
            workerId,
            workerName: entrance.worker.name || `${entrance.worker.firstName || ''} ${entrance.worker.lastName || ''}`.trim(),
            workerEmail: entrance.worker.email || '',
            workerPhoto: entrance.worker.profileImage?.small || entrance.worker.profileImage?.thumbnail || null,
            date: dateString,
            entrances: [],
            house: entrance.house || null
          });
        }

        shiftGroups.get(shiftKey).entrances.push({
          id: entranceId,
          date: entrance.date,
          exitDate: entrance.exitDate || null,
          location: entrance.location || null,
          exitLocation: entrance.exitLocation || null
        });
      });

      console.log(`Grouped into ${shiftGroups.size} potential work shifts`);

      // Process each shift group
      const results = {
        created: 0,
        skipped: 0,
        errors: 0,
        details: []
      };

      const batch = db.batch();
      let batchCount = 0;
      const MAX_BATCH_SIZE = 450; // Leave room for safety

      for (const [shiftId, group] of shiftGroups) {
        try {
          // Check if shift already exists
          const existingShift = await db.collection('workShifts').doc(shiftId).get();

          if (existingShift.exists) {
            results.skipped++;
            results.details.push({
              shiftId,
              status: 'skipped',
              reason: 'already exists'
            });
            continue;
          }

          // Sort entrances by date
          group.entrances.sort((a, b) => a.date.toMillis() - b.date.toMillis());

          // Find first entry and last exit
          const firstEntry = group.entrances[0].date;
          const firstLocation = group.entrances[0].location;

          // Find the last exit from all entrances
          let lastExit = null;
          let lastExitLocation = null;

          for (const entrance of group.entrances) {
            if (entrance.exitDate) {
              if (!lastExit || entrance.exitDate.toMillis() > lastExit.toMillis()) {
                lastExit = entrance.exitDate;
                lastExitLocation = entrance.exitLocation;
              }
            }
          }

          // Calculate total minutes
          const totalMinutes = lastExit
            ? calculateMinutes(firstEntry, lastExit)
            : 0;

          const shiftData = {
            workerId: group.workerId,
            workerName: group.workerName,
            workerEmail: group.workerEmail,
            workerPhoto: group.workerPhoto,
            date: group.date,
            firstEntry,
            lastExit,
            totalMinutes,
            status: lastExit ? 'completed' : 'in_progress',
            entranceIds: group.entrances.map(e => e.id),
            entranceCount: group.entrances.length,
            entryLocation: firstLocation,
            exitLocation: lastExitLocation,
            house: group.house,
            isMigrated: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          if (!dryRun) {
            batch.set(db.collection('workShifts').doc(shiftId), shiftData);
            batchCount++;

            // Commit batch if it's getting full
            if (batchCount >= MAX_BATCH_SIZE) {
              await batch.commit();
              batchCount = 0;
            }
          }

          results.created++;
          results.details.push({
            shiftId,
            status: 'created',
            date: group.date,
            worker: group.workerName,
            entranceCount: group.entrances.length,
            totalMinutes
          });
        } catch (error) {
          console.error(`Error processing shift ${shiftId}:`, error);
          results.errors++;
          results.details.push({
            shiftId,
            status: 'error',
            reason: error.message
          });
        }
      }

      // Commit remaining batch
      if (!dryRun && batchCount > 0) {
        await batch.commit();
      }

      console.log(`Migration complete. Created: ${results.created}, Skipped: ${results.skipped}, Errors: ${results.errors}`);

      return {
        success: true,
        dryRun,
        totalEntrances: entrancesSnapshot.size,
        totalShifts: shiftGroups.size,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors,
        details: results.details.slice(0, 100) // Limit details to prevent large responses
      };
    } catch (error) {
      console.error('Error in migrateEntrancesToWorkShifts:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to migrate entrances.',
        error.message
      );
    }
  });
