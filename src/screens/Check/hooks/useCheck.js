import firestore from '@react-native-firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';

export const useCheck = ({ docId }) => {
  const query = firestore().collection('checklists').doc(docId);

  const { updateFirebase } = useUpdateFirebase('checklists');
  const [checklist] = useDocumentData(query, {
    idField: 'id'
  });

  const reOpenChecklist = async () => {
    await updateFirebase(docId, {
      finished: false
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
