import { useState } from 'react';

import firestore, { firebase } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImageResizer from 'react-native-image-resizer';
import { error as errorLog } from '../lib/logging';

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
  const task = reference.putFile(pathToFile);

  task.on('state_changed', snapshot => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  });

  await task;

  // Obtener URL de descarga
  const url = await reference.getDownloadURL();

  await collectionRef(url);

  console.log('Image uploaded and Firestore updated!');
};

export const usePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  // const {upload} = useUploadCloudinaryImage();

  const deleteFn = firebase.functions().httpsCallable('deletePhotoCloudinary');

  const removePhotos = async (imgs, setter, fbRoute) => {
    const { collectionRef } = fbRoute;
    const photosToDelete = imgs.map(
      async photo =>
        await collectionRef.update({
          photos: firestore.FieldValue.arrayRemove(photo.uri)
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
                await collectionRef.update({
                  photos: firestore.FieldValue.arrayUnion(url)
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
          await collectionRef.update({
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
          await collectionRef.update({
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
