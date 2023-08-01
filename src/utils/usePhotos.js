import {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import {error as errorLog} from '../lib/logging';
import uploadImage from './uploadImage';

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const removePhotos = async (imgs, setter, fbRoute) => {
    const {collectionRef, folder} = fbRoute;

    const photosToDelete = imgs.map(
      async (photo) => {
        const ref = storage().ref(`${folder}/${photo.name}`);
        await ref.delete();
        await collectionRef.update({
          photos: firestore.FieldValue.arrayRemove(photo.uri),
        })
      }
    );

    try {
      setLoading(true);
      await Promise.all(photosToDelete);
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

  const uploadPhotos = async (imgs, fbRoute, withCompression = true) => {

    const {collectionRef, folder} = fbRoute;

    try {
      setLoading(true);

      const promises = imgs.map(
        async (file) => await uploadImage(file.fileUri, `${folder}/${file.fileName}`, withCompression),
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

  return {
    loading,
    error,
    uploadPhotos,
    removePhotos,
  };
};
