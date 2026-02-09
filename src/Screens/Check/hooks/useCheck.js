import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';
import { useQueryClient } from '@tanstack/react-query';

export const useCheck = ({ docId }) => {
  const db = getFirestore();
  const [isDeleted, setIsDeleted] = useState(false);

  // Solo crear query si tenemos docId válido
  const query = docId ? doc(collection(db, 'checklists'), docId) : null;
  const queryClient = useQueryClient();

  const { updateFirebase } = useUpdateFirebase('checklists');
  const [checklist, loading, error] = useDocumentData(
    query,
    query ? { idField: 'id' } : undefined
  );

  // Detectar cuando el documento fue borrado
  // (loading terminó, no hay error, pero checklist es undefined)
  useEffect(() => {
    if (!loading && !error && checklist === undefined && docId) {
      setIsDeleted(true);
    }
  }, [loading, error, checklist, docId]);

  const reOpenChecklist = async () => {
    if (!docId) return;

    await updateFirebase(docId, {
      finished: false
    });

    // Invalidar queries de checklists para actualizar la lista
    queryClient.invalidateQueries({
      queryKey: ['checklistsNotFinishedPaginated']
    });
    queryClient.invalidateQueries({
      queryKey: ['checklistsFinishedPaginated']
    });
  };

  const isCheckFinished = checklist?.finished;
  const isEmailSent = checklist?.send;

  return {
    isCheckFinished,
    isEmailSent,
    reOpenChecklist,
    checklist,
    isDeleted,
    loading
  };
};
