const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {genPassword} = require('../utils');
const {
  sendNewUserConfirmationEmail,
} = require('./sendNewUserEmailConfirmation');

const DEFAULT_PHOTO_URL =
  'https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png';

const createNewUser = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    const {name, surname, email, phone, gender, role} = data;
    const password = genPassword();

    try {
      const newUser = await admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: `${name} ${surname}`,
        photoURL: DEFAULT_PHOTO_URL,
        disabled: false,
      });

      await admin.firestore().collection('users').doc(newUser.uid).set({
        firstName: name,
        lastName: surname,
        phone,
        gender,
        profileImage: DEFAULT_PHOTO_URL,
        role,
        email,
      });
      sendNewUserConfirmationEmail({email, password});
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
  createNewUser,
};
