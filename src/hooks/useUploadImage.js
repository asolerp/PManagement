import { useState } from 'react';
import { usePhotos } from '../utils/usePhotos';

import { error as errorLog } from '../lib/logging';
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  arrayUnion
} from '@react-native-firebase/firestore';
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

// Helper function para subir imágenes
const uploadImageToStorage = async (localPath, storagePath) => {
  const reference = storage().ref(storagePath);
  await reference.putFile(localPath);
  const url = await reference.getDownloadURL();
  return url;
};

const useUploadImageCheck = collectionName => {
  const [idCheckLoading, setIdCheckLoading] = useState();
  const { uploadPhotos, updatePhotoProfile, updateHousePhoto, loading } =
    usePhotos();

  const uploadImages = async (imgs, item, docId, callback) => {
    try {
      if (imgs?.length > 0) {
        const db = getFirestore();

        if (collectionName === 'checklists') {
          setIdCheckLoading(item.id);
          const mappedImages = parseImages(imgs);
          const checksRef = collection(
            doc(collection(db, collectionName), docId),
            'checks'
          );
          const checkDocRef = doc(checksRef, item.id);

          await uploadPhotos(mappedImages, {
            collectionRef: checkDocRef,
            folder: `/${CHECKLISTS}/${docId}/Check/${item.id}/Photos`,
            docId: docId
          });
        }
        if (collectionName === 'incidences') {
          const mappedImages = parseImages(imgs);
          const docRef = doc(collection(db, collectionName), docId);
          await uploadPhotos(mappedImages, {
            collectionRef: docRef,
            folder: `/${INCIDENCES}/${docId}/Photos`,
            docId: docId
          });
        }
        if (collectionName === 'users') {
          const mappedImages = parseImages(imgs);
          const docRef = doc(collection(db, collectionName), docId);
          await updatePhotoProfile(mappedImages[0], {
            collectionRef: docRef,
            folder: `/${USERS}/${docId}/Photos`,
            docId: docId
          });
        }
        if (collectionName === HOUSES) {
          const mappedImages = parseImages(imgs);
          const docRef = doc(collection(db, collectionName), docId);
          await updateHousePhoto(mappedImages[0], {
            collectionRef: docRef,
            folder: `/${HOUSES}/${docId}/houseImage`,
            docId: docId
          });
        }
        if (collectionName === 'entrances') {
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
              const storagePath = `/${ENTRANCES}/${docId}/Photos/${file.fileName}`;
              const url = await uploadImageToStorage(
                resizedImage.uri,
                storagePath
              );
              return url;
            })
          );

          // Actualizar el documento con el formato correcto: images: [{ url: '...' }]
          const imagesArray = urls.map(url => ({ url }));
          const docRef = doc(collection(db, collectionName), docId);
          await updateDoc(docRef, {
            images: arrayUnion(...imagesArray)
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
