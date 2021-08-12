import {useState} from 'react';
import {useUploadCloudinaryImage} from '../../../hooks/useUploadCloudinaryImage';
import firestore from '@react-native-firebase/firestore';
import {INCIDENCES} from '../../../utils/firebaseKeys';
import {error as errorLog} from '../../../lib/logging';

export const usePhotos = ({incidenceId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const {upload} = useUploadCloudinaryImage();

  const removePhotos = async (photos, setter) => {
    const photosToDelete = photos.map(
      async (photo) =>
        await firestore()
          .collection(INCIDENCES)
          .doc(incidenceId)
          .update({
            photos: firestore.FieldValue.arrayRemove(photo.uri),
          }),
    );
    try {
      setLoading(true);
      await Promise.all(photosToDelete);
      setter([]);
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

  const uploadPhotos = async (imgs) => {
    try {
      setLoading(true);
      const uploadImagesCloudinary = imgs.map((file) =>
        upload(file, `/PortManagement/Incidences/${incidenceId}/Photos`),
      );
      const imagesURLs = await Promise.all(uploadImagesCloudinary);

      const uploadImageFirebase = imagesURLs.map((image) =>
        firestore()
          .collection(INCIDENCES)
          .doc(incidenceId)
          .update({
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
