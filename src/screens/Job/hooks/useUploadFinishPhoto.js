import { useState } from 'react';
import { useUploadCloudinaryImage } from '../../../hooks/useUploadCloudinaryImage';

import { error as errorLog } from '../../../lib/logging';

export const useUploadFinishPhoto = () => {
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const { upload } = useUploadCloudinaryImage();

  const uploadFinishPhoto = async (img, fbRoute) => {
    const { collectionRef, cloudinaryFolder } = fbRoute;
    try {
      setLoading(true);
      const imageURL = await upload(img, cloudinaryFolder);
      console.log('IMAGEURL', imageURL);
      await collectionRef.update({
        photoFinish: imageURL,
        photoFinishDate: new Date(),
        done: true
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
    uploadFinishPhoto,
    loading,
    error
  };
};
