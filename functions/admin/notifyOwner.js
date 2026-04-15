const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const { sendResumeChecklistOwner } = require('./sendResumeChecklistOwner');
const { REGION } = require('../utils');

const notifyOwner = onCall(
  {
    region: REGION,
    timeoutSeconds: 540,
    memory: '2GiB',
    invoker: 'public'
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Debes estar autenticado para realizar esta acción.'
      );
    }

    const { checkId } = request.data;
    if (!checkId) {
      throw new HttpsError('invalid-argument', 'Se requiere checkId.');
    }

    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(request.auth.uid)
      .get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;
    if (userRole !== 'admin') {
      console.warn(
        `Usuario ${request.auth.uid} (rol=${userRole}) intentó notifyOwner para ${checkId}`
      );
      throw new HttpsError(
        'permission-denied',
        'No tienes permisos para realizar esta acción.'
      );
    }

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
        .update({ finished: true, send: true });

      const checklist = checklistRef.data();
      const checks = checksRef.docs.map(doc => doc.data());

      const ownerId = checklist.house[0].owner.id;

      const ownerRef = await admin
        .firestore()
        .collection('users')
        .doc(ownerId)
        .get();

      const owner = ownerRef.data();

      const splitAditionalEmails = owner?.aditionalEmail?.split(',');
      const aditionalEmails = splitAditionalEmails?.map(email => email.trim());

      const emailsSeparatedByComma = aditionalEmails?.join(',');

      console.log(
        'Calling sendResumeChecklistOwner with checklistId:',
        checkId
      );

      await sendResumeChecklistOwner({
        email: owner?.aditionalEmail
          ? `${owner.email},${emailsSeparatedByComma}`
          : owner.email,
        checklist,
        checks,
        checklistId: checkId
      });

      console.log(
        'sendResumeChecklistOwner completed for checklistId:',
        checkId
      );
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = {
  notifyOwner
};
