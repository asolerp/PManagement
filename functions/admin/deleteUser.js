const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

const deleteUser = functions
  .region(REGION)
  .firestore.document('users/{userId}')
  .onDelete(async snap => {
    const deletedUser = snap.data();
    console.log('DELETED USER', deletedUser);
    await admin.auth().deleteUser(deletedUser.id);
  });

module.exports = { deleteUser };
