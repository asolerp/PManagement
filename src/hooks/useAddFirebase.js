import {
  getFirestore,
  collection,
  addDoc
} from '@react-native-firebase/firestore';
import { error as errorLog } from '../lib/logging';
import { useState } from 'react';

export const useAddFirebase = () => {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState();

  const addFirebase = async (coll, document) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const collectionRef = collection(db, coll);
      const result = await addDoc(collectionRef, document);
      setLoading(false);
      return result;
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
    addFirebase,
    loading,
    error
  };
};
