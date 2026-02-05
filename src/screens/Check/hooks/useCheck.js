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
  const query = doc(collection(db, 'checklists'), docId);
  const queryClient = useQueryClient();

  const { updateFirebase } = useUpdateFirebase('checklists');
  const [checklist] = useDocumentData(query, {
    idField: 'id'
  });

  const reOpenChecklist = async () => {
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
    checklist
  };
};
