import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot
} from '@react-native-firebase/firestore';

import { useState, useEffect } from 'react';

export const useGetFirebase = (coll, whereConditions) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const [list, setList] = useState([]);

  const onResult = QuerySnapshot => {
    setLoading(false);
    setList(QuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const onError = err => {
    setLoading(false);
    setError(err);
  };

  useEffect(() => {
    const db = getFirestore();
    const collectionRef = collection(db, coll);
    let q = collectionRef;

    if (whereConditions) {
      const queryConstraints = whereConditions.map(w =>
        where(w.label, w.operator, w.condition)
      );
      q = query(collectionRef, ...queryConstraints);
    }

    const unsuscribe = onSnapshot(q, onResult, onError);

    // Stop listening for updates when no longer required
    return () => {
      unsuscribe();
    };
  }, [whereConditions, coll]);

  return {
    list,
    loading,
    error
  };
};
