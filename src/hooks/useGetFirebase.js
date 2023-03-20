import firestore from '@react-native-firebase/firestore';

import {useState, useEffect} from 'react';

export const useGetFirebase = (coll, where) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const [list, setList] = useState([]);

  const onResult = (QuerySnapshot) => {
    setLoading(false);
    setList(QuerySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
  };

  const onError = (err) => {
    setLoading(false);
    setError(err);
  };

  useEffect(() => {
    let subscriber = firestore().collection(coll);

    if (where) {
      where.forEach((w) => {
        subscriber = subscriber.where(w.label, w.operator, w.condition);
      });
    }

    const unsuscribe = subscriber.onSnapshot(onResult, onError);

    // Stop listening for updates when no longer required
    return () => {
      unsuscribe();
    };
  }, [where, coll]);

  return {
    list,
    loading,
    error,
  };
};
