import { useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import {
  arrayRemove,
  arrayUnion,
  updateDoc
} from '@react-native-firebase/firestore';
import ImageResizer from 'react-native-image-resizer';
import { error as errorLog } from '../lib/logging';
import { REGION } from '../firebase/utils';

const uploadImageFromFirebase = async asset => {
  const { uri, storageFolder, fileName, collectionRef } = asset;

  const resizedImage = await ImageResizer.createResizedImage(
    uri,
    800,
    600,
    'JPEG',
    80
  );
  const pathToFile = resizedImage.uri;
  const reference = storage().ref(`${storageFolder}/${fileName}`);

  // Subir la imagen
  await reference.putFile(pathToFile);

  // Obtener URL de descarga
  const url = await reference.getDownloadURL();

  await collectionRef(url);

  console.log('Image uploaded and Firestore updated!');
};

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const app = getApp();
  const functions = getFunctions(app, REGION);
  const deleteFn = httpsCallable(functions, 'deletePhotoCloudinary');

  const removePhotos = async (imgs, setter, fbRoute) => {
    const { collectionRef } = fbRoute;
    const photosToDelete = imgs.map(
      async photo =>
        await updateDoc(collectionRef, {
          photos: arrayRemove(photo.uri)
        })
    );

    const photoIds = imgs.map(photo => {
      const id = photo.ref.split('.')[0];

      return id;
    });

    try {
      setLoading(true);
      await Promise.all(photosToDelete);
      await deleteFn({
        photoIds
      });
      if (setter) {
        setter([]);
      }
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (imgs, fbRoute) => {
    const { collectionRef, folder } = fbRoute;
    try {
      setLoading(true);

      await Promise.all(
        imgs.map(
          async file =>
            await uploadImageFromFirebase({
              uri: file.fileUri,
              storageFolder: folder,
              fileName: file.fileName,
              collectionRef: async url =>
                await updateDoc(collectionRef, {
                  photos: arrayUnion(url)
                })
            })
        )
      );
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateHousePhoto = async (img, fbRoute) => {
    const { collectionRef, folder } = fbRoute;
    try {
      setLoading(true);

      await uploadImageFromFirebase({
        uri: img.fileUri,
        storageFolder: folder,
        fileName: img.fileName,
        collectionRef: async url =>
          await updateDoc(collectionRef, {
            ['houseImage.original']: url,
            ['houseImage.small']: url
          })
      });
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePhotoProfile = async (img, fbRoute) => {
    const { collectionRef, folder } = fbRoute;
    try {
      setLoading(true);

      await uploadImageFromFirebase({
        uri: img.fileUri,
        storageFolder: folder,
        fileName: img.fileName,
        collectionRef: async url =>
          await updateDoc(collectionRef, {
            [`profileImage.original`]: url,
            ['profileImage.small']: url
          })
      });
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
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
    updateHousePhoto,
    updatePhotoProfile
  };
};
