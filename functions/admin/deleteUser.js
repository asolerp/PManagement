const functions = require('firebase-functions');
const admin = require('firebase-admin');

const deleteUser = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const deletedUser = snap.data();
    console.log('DELETED USER', deletedUser);
    await admin.auth().deleteUser(deletedUser.id);
  });

module.exports = {deleteUser};
