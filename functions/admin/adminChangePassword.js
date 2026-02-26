const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

exports.adminChangePassword = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated.'
      );
    }

    const db = admin.firestore();
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can change passwords.'
      );
    }

    const { userId, newPassword } = data;

    if (!userId || !newPassword) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId and newPassword are required.'
      );
    }

    if (newPassword.length < 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Password must be at least 6 characters.'
      );
    }

    try {
      await admin.auth().updateUser(userId, { password: newPassword });

      console.log(
        `Admin ${context.auth.uid} changed password for user ${userId}`
      );

      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to change password.',
        error.message
      );
    }
  });
