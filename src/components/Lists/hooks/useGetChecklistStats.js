import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

export default function useGetChecklistStats({ checkId }) {
  const db = getFirestore();
  const checksQuery = collection(
    doc(collection(db, 'checklists'), checkId),
    'checks'
  );

  const [checks, loadingChecks] = useCollectionData(checksQuery);

  const total = checks?.length;
  const doneChecks = checks?.filter(c => c.done === true).length;

  return {
    done: doneChecks,
    total,
    loadingChecks,
    completePercentage: doneChecks / total
  };
}
