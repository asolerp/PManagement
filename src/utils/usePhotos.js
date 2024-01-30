import {useState} from 'react';
import {useUploadCloudinaryImage} from '../hooks/useUploadCloudinaryImage';
import firestore, {firebase} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import {error as errorLog} from '../lib/logging';

const uploadImageToFirebase = async (asset) => {
  const {uri, storageFolder, fileName} = asset;

  // Create a reference to the location you want to upload to in firebase
  const reference = storage().ref(`${storageFolder}/${fileName}`);

  // Use the putFile() method to upload the image
  await reference.putFile(uri);

  // Get the download URL
  const url = await reference.getDownloadURL();

  return url;
};

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  // const {upload} = useUploadCloudinaryImage();

  const deleteFn = firebase.functions().httpsCallable('deletePhotoCloudinary');

  const removePhotos = async (imgs, setter, fbRoute) => {
    const {collectionRef} = fbRoute;
    const photosToDelete = imgs.map(
      async (photo) =>
        await collectionRef.update({
          photos: firestore.FieldValue.arrayRemove(photo.uri),
        }),
    );

    const photoIds = imgs.map((photo) => {
      const id = photo.ref.split('.')[0];

      return id;
    });

    try {
      setLoading(true);
      await Promise.all(photosToDelete);
      await deleteFn({
        photoIds,
      });
      if (setter) {
        setter([]);
      }
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (imgs, fbRoute) => {
    const {collectionRef, folder} = fbRoute;
    try {
      setLoading(true);

      const promises = imgs.map(
        async (file) =>
          await uploadImageToFirebase({
            uri: file.fileUri,
            storageFolder: folder,
            fileName: file.fileName,
          }),
      );

      const imagesURLs = await Promise.all(promises);

      const uploadImageFirebase = imagesURLs.map((image) =>
        collectionRef.update({
          photos: firestore.FieldValue.arrayUnion(image),
        }),
      );
      await Promise.all(uploadImageFirebase);
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePhotoProfile = async (img, fbRoute) => {
    const {collectionRef, folder} = fbRoute;
    try {
      setLoading(true);

      const imageURL = await uploadImageToFirebase({
        uri: img.fileUri,
        storageFolder: folder,
        fileName: img.fileName,
      });

      collectionRef.update({
        [`profileImage.original`]: imageURL,
        ['profileImage.small']: imageURL,
      });
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    removePhotos,
    uploadPhotos,
    updatePhotoProfile,
  };
};
