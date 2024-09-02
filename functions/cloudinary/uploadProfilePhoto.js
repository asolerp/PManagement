const cloudinary = require('cloudinary').v2;

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

const base64Header = 'data:image/png;base64,';
const userImageFolder = '/PortManagement/Users/';

const uploadProfilePhoto = functions
.region(REGION)  
.runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    try {
      const {
        imageBase64: {fileBase64},
        user,
      } = data;

      const options = {
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      };

      const result = await cloudinary.uploader.upload(
        base64Header + fileBase64,
        {
          ...options,
          folder: userImageFolder + user.id + '/Photos',
          eager: [{aspect_ratio: '1.0', height: 200, crop: 'lfill'}],
          eager_async: true,
        },
      );

      await admin
        .firestore()
        .collection('users')
        .doc(user.id)
        .update({
          ...user,
          profileImage: {
            original: result.url,
            small: result.eager[0].url,
          },
        });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
  uploadProfilePhoto,
};
