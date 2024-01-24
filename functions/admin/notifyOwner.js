const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {sendResumeChecklistOwner} = require('./sendResumeChecklistOwner');

const notifyOwner = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    const {checkId} = data;

    try {
      const checklistRef = await admin
        .firestore()
        .collection('checklists')
        .doc(checkId)
        .get();

      const checksRef = await admin
        .firestore()
        .collection('checklists')
        .doc(checkId)
        .collection('checks')
        .get();

      await admin
        .firestore()
        .collection('checklists')
        .doc(checkId)
        .update({finished: true});

      const checklist = checklistRef.data();
      const checks = checksRef.docs.map((doc) => doc.data());

      const ownerId = checklist.house[0].owner.id;

      const ownerRef = await admin
        .firestore()
        .collection('users')
        .doc(ownerId)
        .get();

      const owner = ownerRef.data();

      sendResumeChecklistOwner({email: owner.email, checklist, checks});
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
  notifyOwner,
};
