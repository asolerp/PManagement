import { useState } from 'react';
import { usePhotos } from '../utils/usePhotos';

import { error as errorLog } from '../lib/logging';
import firestore from '@react-native-firebase/firestore';
import { parseImages } from '../components/Incidence/utils/parserImages';
import {
  CHECKLISTS,
  ENTRANCES,
  HOUSES,
  INCIDENCES,
  USERS
} from '../utils/firebaseKeys';

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
          await uploadPhotos(mappedImages, {
            collectionRef: firestore().collection(collection).doc(docId),
            folder: `/${ENTRANCES}/${docId}/Photos`,
            docId: docId
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
