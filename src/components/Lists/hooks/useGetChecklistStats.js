import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

export default function useGetChecklistStats({checkId}) {
  const checksQuery = firestore()
    .collection('checklists')
    .doc(checkId)
    .collection('checks');

  const [checks, loadingChecks] = useCollectionData(checksQuery);

  const total = checks?.length;
  const doneChecks = checks?.filter((c) => c.done === true).length;

  return {
    loadingChecks,
    completePercentage: doneChecks / total,
  };
}
