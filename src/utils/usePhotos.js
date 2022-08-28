import {useState} from 'react';
import {useUploadCloudinaryImage} from '../hooks/useUploadCloudinaryImage';
import firestore, {firebase} from '@react-native-firebase/firestore';

import {error as errorLog} from '../lib/logging';

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const {upload} = useUploadCloudinaryImage();

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
    const {collectionRef, cloudinaryFolder} = fbRoute;
    try {
      setLoading(true);
      const uploadImagesCloudinary = imgs.map(
        async (file) => await upload(file, cloudinaryFolder),
      );
      const imagesURLs = await Promise.all(uploadImagesCloudinary);

      console.log('URLS', imagesURLs);

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

  return {
    loading,
    error,
    uploadPhotos,
    removePhotos,
  };
};
