import firestore from '@react-native-firebase/firestore';
import {error as errorLog} from '../lib/logging';

import {useState} from 'react';

export const useUpdateFirebase = (coll) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const updateFirebase = async (document, update) => {
    setLoading(true);
    try {
      await firestore().collection(coll).doc(document).update(update);
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
    updateFirebase,
    loading,
    error,
  };
};
