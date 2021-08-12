import {useState} from 'react';
import {useAddFirebase} from './useAddFirebase';
import {useUpdateFirebase} from './useUpdateFirebase';
import {useUploadCloudinaryImage} from './useUploadCloudinaryImage';
import {error as errorLog} from '../lib/logging';

import firestore from '@react-native-firebase/firestore';

const useUploadImageCheck = (collection, docId) => {
  const [loading, setLoading] = useState(true);
  const [idCheckLoading, setIdCheckLoading] = useState();
  const {updateFirebase} = useUpdateFirebase(collection);
  const {upload} = useUploadCloudinaryImage();
  const {addFirebase: addPhoto} = useAddFirebase();

  const uploadImages = async (imgs, item) => {
    setIdCheckLoading(item.id);
    try {
      if (imgs?.length > 0) {
        const uploadImagesArray = imgs
          .map((img, i) => ({
            fileName: img.filename || `image-${i}`,
            fileUri: img.sourceURL || img.path,
            fileType: img.mime,
          }))
          .map((file) =>
            upload(file, `/PortManagement/CheckLists/${docId}/Photos`),
          );

        const imagesURLs = await Promise.all(uploadImagesArray);

        if (collection === 'checklists') {
          await updateFirebase(`${docId}/checks/${item.id}`, {
            numberOfPhotos: item.numberOfPhotos + imagesURLs.length,
          });
          await Promise.all(
            imagesURLs.map((url) => {
              const urlWithTransformation = url.split('/upload/');
              const name = url.split('/');
              let nameWithoutExtension = name[name.length - 1].split('.');
              nameWithoutExtension.splice(-1, 1);
              return addPhoto(
                `${collection}/${docId}/checks/${item.id}/photos`,
                {
                  name: name[name.length - 1],
                  ref: `PortManagement/CheckLists/${docId}/Photos/${nameWithoutExtension.join(
                    '.',
                  )}`,
                  url: urlWithTransformation.join(
                    '/upload/f_auto,q_auto,w_500,dpr_2.0,c_limit/',
                  ),
                },
              );
            }),
          );
        }

        await Promise.all(
          imagesURLs.map((url) => {
            const urlWithTransformation = url.split('/upload/');
            const name = url.split('/');
            let nameWithoutExtension = name[name.length - 1].split('.');
            nameWithoutExtension.splice(-1, 1);
            return firestore().collection(collection);
            // return addPhoto(`${collection}/${docId}/checks/${item.id}/photos`, {
            //   name: name[name.length - 1],
            //   ref: `PortManagement/CheckLists/${docId}/Photos/${nameWithoutExtension.join(
            //     '.',
            //   )}`,
            //   url: urlWithTransformation.join(
            //     '/upload/f_auto,q_auto,w_500,dpr_2.0,c_limit/',
            //   ),
            // });
          }),
        );
      }
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
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
