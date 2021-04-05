import firestore from '@react-native-firebase/firestore';

import {useState} from 'react';

export const useAddFirebase = () => {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState();

  const addFirebase = async (coll, document) => {
    setLoading(true);
    try {
      setLoading(false);
      const result = await firestore().collection(coll).add(document);
      return result;
    } catch (err) {
      console.log(err);
      setError(err);
      setLoading(false);
    }
  };

  return {
    addFirebase,
    loading,
    error,
  };
};
