import {useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';

import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {updateLoadingState} from '../Store/App/appSlice';

export const useGetFirebase = (coll, order, where) => {
  // console.log(where);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  // const handleLoading = useCallback(
  //   (state) => {
  //     dispatch(updateLoadingState(state));
  //   },
  //   [dispatch],
  // );

  const [list, setList] = useState([]);

  const onResult = (QuerySnapshot) => {
    // handleLoading(false);
    setList(QuerySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id})));
  };

  const onError = (err) => {
    // handleLoading(false);
    setError(err);
  };

  useEffect(() => {
    let subscriber = firestore().collection(coll);

    if (where) {
      where.forEach((w) => {
        subscriber = subscriber.where(w.label, w.operator, w.condition);
      });
    }

    if (order) {
      subscriber = subscriber.orderBy(order.field, order.type);
    }
    const unsuscribe = subscriber.onSnapshot(onResult, onError);

    // Stop listening for updates when no longer required
    return () => {
      unsuscribe();
    };
  }, [where, coll, order]);

  return {
    list,
  };
};
