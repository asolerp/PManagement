const functions = require('firebase-functions');
const admin = require('firebase-admin');


const onDeleteCheckList = functions.firestore
.document('checklists/{documentId}')
.onDelete(async (snap, context) => {

    const storage = admin.storage();
    // Get the document ID that was deleted
    const docId = context.params.documentId;

    // The path to the folder in Firebase Cloud Storage
    // Assuming the folder is in the root and has a name identical to the document ID.

    // Get the bucket
    const bucket = storage.bucket();

    // List all files in the folder

    async function deleteFolder(){
      await bucket.deleteFiles({
        prefix: `checklists/${docId}`  // the path of the folder
      });
    }

    await deleteFolder();

  });

  module.exports = {
    onDeleteCheckList,
  };
  