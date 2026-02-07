/**
 * Utility functions for work shifts
 */

/**
 * Get date string in YYYY-MM-DD format from a Firestore Timestamp
 * @param {FirebaseFirestore.Timestamp} timestamp
 * @returns {string}
 */
const getDateString = timestamp => {
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate total minutes between two timestamps
 * @param {FirebaseFirestore.Timestamp} start
 * @param {FirebaseFirestore.Timestamp} end
 * @returns {number}
 */
const calculateMinutes = (start, end) => {
  if (!start || !end) return 0;
  const startMs = start.toMillis();
  const endMs = end.toMillis();
  return Math.round((endMs - startMs) / (1000 * 60));
};

/**
 * Format minutes to human readable string
 * @param {number} minutes
 * @returns {string}
 */
const formatMinutesToHours = minutes => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Generate workShift document ID from workerId and date
 * @param {string} workerId
 * @param {string} dateString - YYYY-MM-DD
 * @returns {string}
 */
const generateShiftId = (workerId, dateString) => {
  return `${workerId}_${dateString}`;
};

/**
 * Check if user has admin role
 * @param {admin.firestore.Firestore} db
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
const isAdmin = async (db, uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData.role === 'admin';
};

module.exports = {
  getDateString,
  calculateMinutes,
  formatMinutesToHours,
  generateShiftId,
  isAdmin
};
