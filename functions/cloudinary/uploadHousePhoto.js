const cloudinary = require('cloudinary').v2;

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const base64Header = 'data:image/png;base64,';
const houseImageFolder = '/PortManagement/Houses/';

const uploadHousePhoto = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data) => {
    try {
      const {
        houseId,
        imageBase64: {fileBase64},
        house,
      } = data;

      let firestoreResult;

      if (!houseId) {
        firestoreResult = await admin
          .firestore()
          .collection('houses')
          .add({...house});
      }

      const options = {
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      };

      const result = await cloudinary.uploader.upload(
        base64Header + fileBase64,
        {
          ...options,
          folder: houseId
            ? houseImageFolder + houseId
            : houseImageFolder + firestoreResult.id,
          eager: [{aspect_ratio: '1.0', height: 200, crop: 'lfill'}],
          eager_async: true,
        },
      );

      await admin
        .firestore()
        .collection('houses')
        .doc(houseId ? houseId : firestoreResult.id)
        .update({
          houseImage: {
            original: result.url,
            small: result.eager[0].url,
          },
        });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {
  uploadHousePhoto,
};
