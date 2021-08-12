import {useState} from 'react';
import storage from '@react-native-firebase/storage';
import {error as errorLog} from '../lib/logging';

export const useDeleteFirebaseImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const deleteImage = async (ref) => {
    try {
      setLoading(true);
      await storage().ref(ref).delete();
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
    deleteImage,
    loading,
    error,
  };
};
