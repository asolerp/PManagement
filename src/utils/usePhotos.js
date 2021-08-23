import {useState} from 'react';
import {useUploadCloudinaryImage} from '../hooks/useUploadCloudinaryImage';
import firestore from '@react-native-firebase/firestore';

import {error as errorLog} from '../lib/logging';

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const {upload} = useUploadCloudinaryImage();

  const removePhotos = async (photos, setter, fbRoute) => {
    const {docId, collection} = fbRoute;
    const photosToDelete = photos.map(
      async (photo) =>
        await firestore()
          .collection(collection)
          .doc(docId)
          .update({
            photos: firestore.FieldValue.arrayRemove(photo.uri),
          }),
    );
    try {
      setLoading(true);
      await Promise.all(photosToDelete);
      setter([]);
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
    const {docId, collectionRef, cloudinaryFolder} = fbRoute;
    try {
      setLoading(true);
      const uploadImagesCloudinary = imgs.map((file) =>
        upload(file, `/PortManagement/${cloudinaryFolder}/${docId}/Photos`),
      );
      const imagesURLs = await Promise.all(uploadImagesCloudinary);

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
