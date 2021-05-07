import {useState} from 'react';
import {Platform} from 'react-native';
import {useAddFirebase} from './useAddFirebase';
import {useUpdateFirebase} from './useUpdateFirebase';
import {useUploadCloudinaryImage} from './useUploadCloudinaryImage';

const useUploadImageCheck = (checkId) => {
  const [loading, setLoading] = useState(true);
  const [idCheckLoading, setIdCheckLoading] = useState();
  const {updateFirebase} = useUpdateFirebase('checklists');
  const {upload} = useUploadCloudinaryImage();
  const {addFirebase: addPhoto} = useAddFirebase();

  const uploadImages = async (imgs, item) => {
    setLoading(true);
    setIdCheckLoading(item.id);
    try {
      if (imgs?.length > 0) {
        const uploadImages = imgs
          .map((img, i) => ({
            fileName: img.filename || `image-${i}`,
            fileUri: Platform.OS === 'android' ? img.path : img.sourceURL,
            fileType: img.mime,
          }))
          .map((file) =>
            upload(file, `/PortManagement/CheckLists/${checkId}/Photos`),
          );

        const imagesURLs = await Promise.all(uploadImages);

        await updateFirebase(`${checkId}/checks/${item.id}`, {
          numberOfPhotos: item.numberOfPhotos + imagesURLs.length,
        });
        await Promise.all(
          imagesURLs.map((url) => {
            const urlWithTransformation = url.split('/upload/');
            const name = url.split('/');
            let nameWithoutExtension = name[name.length - 1].split('.');
            nameWithoutExtension.splice(-1, 1);
            return addPhoto(`checklists/${checkId}/checks/${item.id}/photos`, {
              name: name[name.length - 1],
              ref: `PortManagement/CheckLists/${checkId}/Photos/${nameWithoutExtension.join(
                '.',
              )}`,
              url: urlWithTransformation.join(
                '/upload/f_auto,q_auto,w_500,dpr_2.0,c_limit/',
              ),
            });
          }),
        );
      }
    } catch (err) {
      console.log(err);
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
