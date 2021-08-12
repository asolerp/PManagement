import firestore from '@react-native-firebase/firestore';
import {error as errorLog} from '../lib/logging';

import {useState} from 'react';

export const useDeleteFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const deleteFirebase = async (coll, doc) => {
    setLoading(true);
    try {
      await firestore().collection(coll).doc(doc).delete();
      setLoading(false);
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
      setError(err);
      setLoading(false);
    }
  };

  return {
    deleteFirebase,
    loading,
    error,
  };
};
