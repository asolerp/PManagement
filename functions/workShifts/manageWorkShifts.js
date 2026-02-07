/**
 * Functions for manual work shift management by admins
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const { isAdmin, generateShiftId, calculateMinutes } = require('./utils');

/**
 * Create a manual work shift (for admin corrections)
 */
exports.createWorkShift = functions
  .region(REGION)
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
          'Only administrators can create work shifts.'
        );
      }

      const { workerId, date, firstEntry, lastExit, notes } = data;

      // Validate required fields
      if (!workerId || !date || !firstEntry) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'workerId, date, and firstEntry are required.'
        );
      }

      // Get worker data
      const workerDoc = await db.collection('users').doc(workerId).get();
      if (!workerDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Worker not found.');
      }
      const workerData = workerDoc.data();

      // Generate shift ID
      const shiftId = generateShiftId(workerId, date);

      // Check if shift already exists
      const existingShift = await db.collection('workShifts').doc(shiftId).get();
      if (existingShift.exists) {
        throw new functions.https.HttpsError(
          'already-exists',
          'A work shift already exists for this worker on this date.'
        );
      }

      // Create timestamps
      const firstEntryTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(firstEntry)
      );
      const lastExitTimestamp = lastExit
        ? admin.firestore.Timestamp.fromDate(new Date(lastExit))
        : null;

      // Calculate total minutes
      const totalMinutes = lastExitTimestamp
        ? calculateMinutes(firstEntryTimestamp, lastExitTimestamp)
        : 0;

      // Create the shift
      const shiftData = {
        workerId,
        workerName: workerData.name || `${workerData.firstName || ''} ${workerData.lastName || ''}`.trim(),
        workerEmail: workerData.email || '',
        workerPhoto: workerData.profileImage?.small || workerData.profileImage?.thumbnail || null,
        date,
        firstEntry: firstEntryTimestamp,
        lastExit: lastExitTimestamp,
        totalMinutes,
        status: lastExitTimestamp ? 'completed' : 'in_progress',
        entranceIds: [],
        entranceCount: 0,
        entryLocation: null,
        exitLocation: null,
        house: null,
        isManual: true, // Flag for manually created shifts
        createdBy: context.auth.uid,
        notes: notes || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('workShifts').doc(shiftId).set(shiftData);

      console.log(`Admin ${context.auth.uid} created manual shift ${shiftId}`);

      return {
        success: true,
        shiftId,
        message: 'Work shift created successfully.'
      };
    } catch (error) {
      console.error('Error in createWorkShift:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create work shift.',
        error.message
      );
    }
  });

/**
 * Update an existing work shift (for admin corrections)
 */
exports.updateWorkShift = functions
  .region(REGION)
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
          'Only administrators can update work shifts.'
        );
      }

      const { shiftId, firstEntry, lastExit, notes, status } = data;

      // Validate required fields
      if (!shiftId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'shiftId is required.'
        );
      }

      // Check if shift exists
      const shiftRef = db.collection('workShifts').doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (!shiftDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Work shift not found.');
      }

      const currentData = shiftDoc.data();
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: context.auth.uid
      };

      // Update firstEntry if provided
      if (firstEntry) {
        updateData.firstEntry = admin.firestore.Timestamp.fromDate(
          new Date(firstEntry)
        );
      }

      // Update lastExit if provided
      if (lastExit !== undefined) {
        updateData.lastExit = lastExit
          ? admin.firestore.Timestamp.fromDate(new Date(lastExit))
          : null;
      }

      // Update notes if provided
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // Calculate new total minutes
      const newFirstEntry = updateData.firstEntry || currentData.firstEntry;
      const newLastExit =
        updateData.lastExit !== undefined
          ? updateData.lastExit
          : currentData.lastExit;

      if (newFirstEntry && newLastExit) {
        updateData.totalMinutes = calculateMinutes(newFirstEntry, newLastExit);
        updateData.status = status || 'completed';
      } else if (status) {
        updateData.status = status;
      }

      await shiftRef.update(updateData);

      console.log(`Admin ${context.auth.uid} updated shift ${shiftId}`);

      return {
        success: true,
        message: 'Work shift updated successfully.'
      };
    } catch (error) {
      console.error('Error in updateWorkShift:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update work shift.',
        error.message
      );
    }
  });

/**
 * Delete a work shift (for admin corrections)
 */
exports.deleteWorkShift = functions
  .region(REGION)
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
          'Only administrators can delete work shifts.'
        );
      }

      const { shiftId } = data;

      if (!shiftId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'shiftId is required.'
        );
      }

      // Check if shift exists
      const shiftRef = db.collection('workShifts').doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (!shiftDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Work shift not found.');
      }

      // Delete the shift
      await shiftRef.delete();

      console.log(`Admin ${context.auth.uid} deleted shift ${shiftId}`);

      return {
        success: true,
        message: 'Work shift deleted successfully.'
      };
    } catch (error) {
      console.error('Error in deleteWorkShift:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to delete work shift.',
        error.message
      );
    }
  });
