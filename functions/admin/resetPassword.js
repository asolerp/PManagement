const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendResetEmailUser } = require('./sendResetEmailUser');

const resetPassword = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    const {email} = data;
    try {
      admin.auth().generatePasswordResetLink(email)
      .then((link) => {
          return sendResetEmailUser({email, link});
      })
      .catch((error) => {
          console.log('Error sending password reset email:', error);
      });
    } catch (err) {
      throw new Error(err);
    }
  });

module.exports = {
    resetPassword,
};
