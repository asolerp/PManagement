/**
 * Firestore trigger for entrances collection
 * Updates workShifts collection when entrances are created or updated
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const {
  getDateString,
  calculateMinutes,
  generateShiftId
} = require('./utils');

/**
 * Trigger when an entrance document is created
 * Creates or updates the corresponding workShift
 */
exports.onEntranceCreated = functions
  .region(REGION)
  .firestore.document('entrances/{entranceId}')
  .onCreate(async (snap, context) => {
    const entrance = snap.data();
    const entranceId = context.params.entranceId;

    try {
      // Validate entrance data
      if (!entrance.worker?.id || !entrance.date) {
        console.log('Invalid entrance data, skipping:', entranceId);
        return null;
      }

      const db = admin.firestore();
      const workerId = entrance.worker.id;
      const dateString = getDateString(entrance.date);
      const shiftId = generateShiftId(workerId, dateString);

      const shiftRef = db.collection('workShifts').doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (shiftDoc.exists) {
        // Update existing shift - add entrance to the list
        const shiftData = shiftDoc.data();
        const entranceIds = shiftData.entranceIds || [];

        // Check if this entrance's time is earlier than current firstEntry
        const currentFirstEntry = shiftData.firstEntry;
        const isEarlier = entrance.date.toMillis() < currentFirstEntry.toMillis();

        await shiftRef.update({
          entranceIds: admin.firestore.FieldValue.arrayUnion(entranceId),
          ...(isEarlier && {
            firstEntry: entrance.date,
            entryLocation: entrance.location || null
          }),
          entranceCount: entranceIds.length + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Updated workShift ${shiftId} with entrance ${entranceId}`);
      } else {
        // Create new shift
        await shiftRef.set({
          workerId: workerId,
          workerName: entrance.worker.name || `${entrance.worker.firstName || ''} ${entrance.worker.lastName || ''}`.trim(),
          workerEmail: entrance.worker.email || '',
          workerPhoto: entrance.worker.profileImage?.small || entrance.worker.profileImage?.thumbnail || null,
          date: dateString,
          firstEntry: entrance.date,
          lastExit: null,
          totalMinutes: 0,
          status: 'in_progress',
          entranceIds: [entranceId],
          entranceCount: 1,
          entryLocation: entrance.location || null,
          exitLocation: null,
          house: entrance.house || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Created new workShift ${shiftId} for entrance ${entranceId}`);
      }

      return null;
    } catch (error) {
      console.error('Error in onEntranceCreated:', error);
      throw error;
    }
  });

/**
 * Trigger when an entrance document is updated
 * Updates the workShift when exit is registered
 */
exports.onEntranceUpdated = functions
  .region(REGION)
  .firestore.document('entrances/{entranceId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const entranceId = context.params.entranceId;

    try {
      // Only process if exitDate was just added
      if (before.exitDate || !after.exitDate) {
        console.log('No new exit registered, skipping:', entranceId);
        return null;
      }

      // Validate data
      if (!after.worker?.id || !after.date) {
        console.log('Invalid entrance data, skipping:', entranceId);
        return null;
      }

      const db = admin.firestore();
      const workerId = after.worker.id;
      const dateString = getDateString(after.date);
      const shiftId = generateShiftId(workerId, dateString);

      const shiftRef = db.collection('workShifts').doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (!shiftDoc.exists) {
        console.log('WorkShift not found for update:', shiftId);
        return null;
      }

      const shiftData = shiftDoc.data();

      // Check if this exit is later than current lastExit
      const currentLastExit = shiftData.lastExit;
      const isLater =
        !currentLastExit ||
        after.exitDate.toMillis() > currentLastExit.toMillis();

      if (isLater) {
        const totalMinutes = calculateMinutes(
          shiftData.firstEntry,
          after.exitDate
        );

        await shiftRef.update({
          lastExit: after.exitDate,
          exitLocation: after.exitLocation || null,
          totalMinutes: totalMinutes,
          status: 'completed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(
          `Updated workShift ${shiftId} with exit. Total: ${totalMinutes} minutes`
        );
      }

      return null;
    } catch (error) {
      console.error('Error in onEntranceUpdated:', error);
      throw error;
    }
  });
