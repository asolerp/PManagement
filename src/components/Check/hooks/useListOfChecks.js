import {firebase} from '@react-native-firebase/firestore';
import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import firestore from '@react-native-firebase/firestore';

import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';
import {error} from '../../../lib/logging';
import {useEffect, useState} from 'react';

export const useListOfChecks = ({list, checkId, isCheckFinished}) => {
  const [allChecked, setAllChecked] = useState();
  const user = useSelector(userSelector);
  const {updateFirebase} = useUpdateFirebase('checklists');

  const handleRemoveAllChecks = async () => {
    const batch = firestore().batch();
    try {
      list.forEach((check) => {
        const docRef = firestore()
          .collection('checklists')
          .doc(checkId)
          .collection('checks')
          .doc(check?.id);
        const doc = {...check, date: null, done: false, worker: null};
        batch.set(docRef, doc);
      });
      await batch.commit();
      await updateFirebase(`${checkId}`, {
        done: firebase.firestore.FieldValue.increment(-list.length),
      });
      setAllChecked(false);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  const handleCheckAll = async () => {
    const batch = firestore().batch();

    try {
      list.forEach((check) => {
        const docRef = firestore()
          .collection('checklists')
          .doc(checkId)
          .collection('checks')
          .doc(check?.id);
        const doc = {...check, date: new Date(), done: true, worker: user};
        batch.set(docRef, doc);
      });
      await batch.commit();
      await updateFirebase(`${checkId}`, {
        done: firebase.firestore.FieldValue.increment(list.length),
      });
      setAllChecked(true);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  useEffect(() => {
    console.log('FINISH', isCheckFinished);
    if (isCheckFinished) {
      setAllChecked(false);
    } else {
      setAllChecked(true);
    }
  }, [isCheckFinished]);

  return {
    allChecked,
    handleCheckAll,
    handleRemoveAllChecks,
  };
};
