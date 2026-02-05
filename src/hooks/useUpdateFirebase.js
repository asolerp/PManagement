import {
  getFirestore,
  collection,
  doc,
  updateDoc
} from '@react-native-firebase/firestore';
import { error as errorLog } from '../lib/logging';

import { useState } from 'react';

export const useUpdateFirebase = coll => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const updateFirebase = async (document, update) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const docRef = doc(collection(db, coll), document);
      await updateDoc(docRef, update);
      setLoading(false);
    } catch (err) {
      errorLog({
        message: err.message,
        track: true,
        asToast: true
      });
      setError(err);
      setLoading(false);
    }
  };

  return {
    updateFirebase,
    loading,
    error
  };
};
