import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  increment
} from '@react-native-firebase/firestore';
import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';

import { useSelector } from 'react-redux';
import { userSelector } from '../../../Store/User/userSlice';
import { error } from '../../../lib/logging';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useListOfChecks = ({ list, checkId, isCheckFinished }) => {
  const [allChecked, setAllChecked] = useState();
  const user = useSelector(userSelector);
  const { updateFirebase } = useUpdateFirebase('checklists');
  const queryClient = useQueryClient();

  const handleRemoveAllChecks = async () => {
    const db = getFirestore();
    const batch = writeBatch(db);
    try {
      list.forEach(check => {
        const checksRef = collection(
          doc(collection(db, 'checklists'), checkId),
          'checks'
        );
        const docRef = doc(checksRef, check?.id);
        const docData = { ...check, date: null, done: false, worker: null };
        batch.set(docRef, docData);
      });
      await batch.commit();
      await updateFirebase(`${checkId}`, {
        done: increment(-list.length)
      });
      setAllChecked(false);

      // Invalidar queries de checklists para actualizar la lista
      queryClient.invalidateQueries({
        queryKey: ['checklistsNotFinishedPaginated']
      });
      queryClient.invalidateQueries({
        queryKey: ['checklistsFinishedPaginated']
      });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    }
  };

  const handleCheckAll = async () => {
    const db = getFirestore();
    const batch = writeBatch(db);
    try {
      list.forEach(check => {
        const checksRef = collection(
          doc(collection(db, 'checklists'), checkId),
          'checks'
        );
        const docRef = doc(checksRef, check?.id);
        const docData = {
          ...check,
          date: new Date(),
          done: true,
          worker: user
        };
        batch.set(docRef, docData);
      });
      await batch.commit();
      await updateFirebase(`${checkId}`, {
        done: increment(list.length)
      });
      setAllChecked(true);

      // Invalidar queries de checklists para actualizar la lista
      queryClient.invalidateQueries({
        queryKey: ['checklistsNotFinishedPaginated']
      });
      queryClient.invalidateQueries({
        queryKey: ['checklistsFinishedPaginated']
      });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    }
  };

  useEffect(() => {
    if (isCheckFinished) {
      setAllChecked(false);
    } else {
      setAllChecked(true);
    }
  }, [isCheckFinished]);

  return {
    allChecked,
    handleCheckAll,
    handleRemoveAllChecks
  };
};
