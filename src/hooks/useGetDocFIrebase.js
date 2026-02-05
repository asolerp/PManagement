import {
  getFirestore,
  collection,
  doc,
  onSnapshot
} from '@react-native-firebase/firestore';

import { useState, useEffect } from 'react';

export const useGetDocFirebase = (coll, docId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [document, setDocument] = useState([]);

  const onResult = QuerySnapshot => {
    setLoading(false);
    setDocument({ ...QuerySnapshot.data(), id: QuerySnapshot.id });
  };

  const onError = err => {
    setLoading(false);
    setError(err);
  };

  useEffect(() => {
    const db = getFirestore();
    const docRef = doc(collection(db, coll), docId);
    const subscriber = onSnapshot(docRef, onResult, onError);

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [coll, docId]);

  return {
    document,
    loading,
    error
  };
};
