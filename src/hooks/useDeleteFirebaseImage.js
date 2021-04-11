import {useState} from 'react';
import storage from '@react-native-firebase/storage';

export const useDeleteFirebaseImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const deleteImage = async (ref) => {
    try {
      setLoading(true);
      await storage().ref(ref).delete();
    } catch (err) {
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
