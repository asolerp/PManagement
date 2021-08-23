import {useState} from 'react';
import {usePhotos} from '../utils/usePhotos';

import {error as errorLog} from '../lib/logging';
import firestore from '@react-native-firebase/firestore';
import {parseImages} from '../components/Incidence/utils/parserImages';

const useUploadImageCheck = (collection, docId) => {
  const [idCheckLoading, setIdCheckLoading] = useState();
  const {uploadPhotos, loading} = usePhotos();

  const uploadImages = async (imgs, item) => {
    setIdCheckLoading(item.id);
    try {
      if (imgs?.length > 0) {
        if (collection === 'checklists') {
          const mappedImages = parseImages(imgs);
          uploadPhotos(mappedImages, {
            collectionRef: firestore()
              .collection(collection)
              .doc(docId)
              .collection('checks')
              .doc(item.id),
            cloudinaryFolder: 'Checklists',
            docId: item.id,
          });
        }
      }
    } catch (err) {
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
