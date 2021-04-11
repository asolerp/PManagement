import React, {useState} from 'react';
import storage from '@react-native-firebase/storage';

export const useUploadFirebaseStorageImage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();

  const uploadImageToStorage = async (path, name) => {
    try {
      setLoading(true);
      let reference = storage().ref(name);
      let task = reference.putFile(path);
      await task;
      setLoading(false);
      setStatus('Image uploaded successfully');
      return {
        name: name,
        downloadURL: await storage().ref(name).getDownloadURL(),
      };
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImageToStorage,
    loading,
    status,
  };
};
