import firestore from '@react-native-firebase/firestore';

import {useState, useEffect} from 'react';

export const useGetDocFirebase = (coll, doc) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [document, setDocument] = useState([]);

  const onResult = (QuerySnapshot) => {
    setLoading(false);
    setDocument({...QuerySnapshot.data(), id: QuerySnapshot.id});
  };

  const onError = (err) => {
    setLoading(false);
    setError(err);
  };

  useEffect(() => {
    const subscriber = firestore()
      .collection(coll)
      .doc(doc)
      .onSnapshot(onResult, onError);

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  return {
    document,
    loading,
    error,
  };
};
