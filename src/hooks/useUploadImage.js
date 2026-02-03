import { useState } from 'react';
import { usePhotos } from '../utils/usePhotos';

import { error as errorLog } from '../lib/logging';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImageResizer from 'react-native-image-resizer';
import { parseImages } from '../components/Incidence/utils/parserImages';
import {
  CHECKLISTS,
  ENTRANCES,
  HOUSES,
  INCIDENCES,
  USERS
} from '../utils/firebaseKeys';

// Helper function para subir imágenes de entrances
const uploadImageFromFirebase = async asset => {
  const { uri, storageFolder, fileName } = asset;

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

  await task;

  // Obtener URL de descarga
  const url = await reference.getDownloadURL();

  return url;
};

const useUploadImageCheck = collection => {
  const [idCheckLoading, setIdCheckLoading] = useState();
  const { uploadPhotos, updatePhotoProfile, updateHousePhoto, loading } =
    usePhotos();

  const uploadImages = async (imgs, item, docId, callback) => {
    try {
      if (imgs?.length > 0) {
        if (collection === 'checklists') {
          setIdCheckLoading(item.id);
          const mappedImages = parseImages(imgs);
          await uploadPhotos(mappedImages, {
            collectionRef: firestore()
              .collection(collection)
              .doc(docId)
              .collection('checks')
              .doc(item.id),
            folder: `/${CHECKLISTS}/${docId}/Check/${item.id}/Photos`,
            docId: docId
          });
        }
        if (collection === 'incidences') {
          const mappedImages = parseImages(imgs);
          await uploadPhotos(mappedImages, {
            collectionRef: firestore().collection(collection).doc(docId),
            folder: `/${INCIDENCES}/${docId}/Photos`,
            docId: docId
          });
        }
        if (collection === 'users') {
          const mappedImages = parseImages(imgs);
          await updatePhotoProfile(mappedImages[0], {
            collectionRef: firestore().collection(collection).doc(docId),
            folder: `/${USERS}/${docId}/Photos`,
            docId: docId
          });
        }
        if (collection === HOUSES) {
          const mappedImages = parseImages(imgs);
          await updateHousePhoto(mappedImages[0], {
            collectionRef: firestore().collection(collection).doc(docId),
            folder: `/${HOUSES}/${docId}/houseImage`,
            docId: docId
          });
        }
        if (collection === 'entrances') {
          const mappedImages = parseImages(imgs);
          // Para entrances, guardamos en formato images: [{ url: '...' }]
          const urls = await Promise.all(
            mappedImages.map(async file => {
              const resizedImage = await ImageResizer.createResizedImage(
                file.fileUri,
                800,
                600,
                'JPEG',
                80
              );
              const pathToFile = resizedImage.uri;
              const reference = storage().ref(
                `/${ENTRANCES}/${docId}/Photos/${file.fileName}`
              );

              // Subir la imagen
              const task = reference.putFile(pathToFile);
              await task;

              // Obtener URL de descarga
              const url = await reference.getDownloadURL();
              return url;
            })
          );

          // Actualizar el documento con el formato correcto: images: [{ url: '...' }]
          const imagesArray = urls.map(url => ({ url }));
          await firestore()
            .collection(collection)
            .doc(docId)
            .update({
              images: firestore.FieldValue.arrayUnion(...imagesArray)
            });
        }
      }
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      callback && callback();
      setIdCheckLoading(null);
    }
  };

  return {
    loading,
    idCheckLoading,
    uploadImages
  };
};

export default useUploadImageCheck;
