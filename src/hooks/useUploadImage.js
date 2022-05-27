import {useState} from 'react';
import {usePhotos} from '../utils/usePhotos';

import {error as errorLog} from '../lib/logging';
import firestore from '@react-native-firebase/firestore';
import {parseImages} from '../components/Incidence/utils/parserImages';
import {CHECKLISTS} from '../utils/firebaseKeys';

const useUploadImageCheck = (collection, docId) => {
  const [idCheckLoading, setIdCheckLoading] = useState();
  const {uploadPhotos, loading} = usePhotos();

  const uploadImages = async (imgs, item) => {
    try {
      setIdCheckLoading(item.id);

      if (imgs?.length > 0) {
        if (collection === 'checklists') {
          const mappedImages = parseImages(imgs);
          await uploadPhotos(mappedImages, {
            collectionRef: firestore()
              .collection(collection)
              .doc(docId)
              .collection('checks')
              .doc(item.id),
            cloudinaryFolder: `/PortManagement/${CHECKLISTS}/${docId}/Check/${item.id}/Photos`,
            docId: docId,
          });
        }
      }
    } catch (err) {
      console.log(err);
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setIdCheckLoading(null);
    }
  };

  return {
    loading,
    idCheckLoading,
    uploadImages,
  };
};

export default useUploadImageCheck;
