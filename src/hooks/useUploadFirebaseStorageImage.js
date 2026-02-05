import { useState } from 'react';
import storage from '@react-native-firebase/storage';
import { error as errorLog } from '../lib/logging';

export const useUploadFirebaseStorageImage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();

  const uploadImageToStorage = async (path, name) => {
    try {
      setLoading(true);
      const reference = storage().ref(name);
      await reference.putFile(path);
      setLoading(false);
      setStatus('Image uploaded successfully');
      const downloadURL = await reference.getDownloadURL();
      return {
        name: name,
        downloadURL: downloadURL
      };
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImageToStorage,
    loading,
    status
  };
};
