/**
 * Callable function to get work shifts for the admin dashboard
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');
const { isAdmin } = require('./utils');

/**
 * Get work shifts with filters
 * Only accessible by admin users
 */
exports.getWorkShifts = functions
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
          'Only administrators can access work shifts.'
        );
      }

      const { startDate, endDate, workerId, status, limit = 100 } = data;

      // Build query
      let query = db.collection('workShifts');

      // Filter by date range
      if (startDate) {
        query = query.where('date', '>=', startDate);
      }
      if (endDate) {
        query = query.where('date', '<=', endDate);
      }

      // Filter by worker
      if (workerId) {
        query = query.where('workerId', '==', workerId);
      }

      // Filter by status
      if (status) {
        query = query.where('status', '==', status);
      }

      // Order by date descending
      query = query.orderBy('date', 'desc').limit(limit);

      const snapshot = await query.get();

      const shifts = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        shifts.push({
          id: doc.id,
          ...data,
          // Convert timestamps to ISO strings for JSON
          firstEntry: data.firstEntry?.toDate()?.toISOString() || null,
          lastExit: data.lastExit?.toDate()?.toISOString() || null,
          createdAt: data.createdAt?.toDate()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate()?.toISOString() || null
        });
      });

      return {
        success: true,
        shifts,
        count: shifts.length
      };
    } catch (error) {
      console.error('Error in getWorkShifts:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get work shifts.',
        error.message
      );
    }
  });

/**
 * Get dashboard stats for admins
 */
exports.getWorkShiftStats = functions
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
          'Only administrators can access work shift stats.'
        );
      }

      const { date } = data;
      const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get shifts for today
      const todayShifts = await db
        .collection('workShifts')
        .where('date', '==', targetDate)
        .get();

      let totalWorkers = 0;
      let completedShifts = 0;
      let inProgressShifts = 0;
      let totalMinutes = 0;

      todayShifts.forEach(doc => {
        const shift = doc.data();
        totalWorkers++;

        if (shift.status === 'completed') {
          completedShifts++;
          totalMinutes += shift.totalMinutes || 0;
        } else {
          inProgressShifts++;
        }
      });

      // Get unique workers count (all time)
      const workersSnapshot = await db
        .collection('users')
        .where('role', '==', 'worker')
        .get();

      return {
        success: true,
        stats: {
          date: targetDate,
          totalWorkersToday: totalWorkers,
          completedShifts,
          inProgressShifts,
          totalMinutesWorked: totalMinutes,
          totalHoursWorked: Math.round((totalMinutes / 60) * 100) / 100,
          totalRegisteredWorkers: workersSnapshot.size
        }
      };
    } catch (error) {
      console.error('Error in getWorkShiftStats:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get work shift stats.',
        error.message
      );
    }
  });

/**
 * Get all workers for filter dropdown
 */
exports.getWorkers = functions
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
          'Only administrators can access workers list.'
        );
      }

      const snapshot = await db
        .collection('users')
        .where('role', '==', 'worker')
        .get();

      const workers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Handle different photo field formats
        let photo =
          data.profileImage?.small ||
          data.profileImage?.thumbnail ||
          data.profileImage?.original ||
          (typeof data.profileImage === 'string' ? data.profileImage : null) ||
          data.photoURL ||
          data.photo ||
          null;

        // Filter out old Cloudinary URLs that no longer work
        if (photo && photo.includes('cloudinary')) {
          photo = null;
        }

        workers.push({
          id: doc.id,
          name:
            `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
            data.name ||
            data.email,
          email: data.email,
          photo
        });
      });

      // Sort by name in memory
      workers.sort((a, b) => a.name.localeCompare(b.name));

      return {
        success: true,
        workers,
        count: workers.length
      };
    } catch (error) {
      console.error('Error in getWorkers:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get workers.',
        error.message
      );
    }
  });
