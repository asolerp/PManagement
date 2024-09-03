const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { sendResumeChecklistOwner } = require('./sendResumeChecklistOwner');
const { REGION } = require('../utils');

const notifyOwner = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async data => {
    const { checkId } = data;

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
        .update({ finished: true });

      const checklist = checklistRef.data();
      const checks = checksRef.docs.map(doc => doc.data());

      const ownerId = checklist.house[0].owner.id;

      const ownerRef = await admin
        .firestore()
        .collection('users')
        .doc(ownerId)
        .get();

      const owner = ownerRef.data();

      const splitAditionalEmails = owner.aditionalEmail.split(',');
      const aditionalEmails = splitAditionalEmails.map(email => email.trim());

      const emailsSeparatedByComma = aditionalEmails.join(',');

      sendResumeChecklistOwner({
        email: owner?.aditionalEmail
          ? `${owner.email},${emailsSeparatedByComma}`
          : owner.email,
        checklist,
        checks
      });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
  notifyOwner
};
