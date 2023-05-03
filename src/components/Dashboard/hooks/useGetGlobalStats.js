import {useCollectionData} from 'react-firebase-hooks/firestore';
import firestore from '@react-native-firebase/firestore';
import {CHECKLISTS, INCIDENCES, JOBS} from '../../../utils/firebaseKeys';

export const useGetGlobalStats = ({uid}) => {
  const checkListsQuery = uid
    ? firestore()
        .collection(CHECKLISTS)
        .where('finished', '==', false)
        .where('workersId', 'array-contains', uid)
    : firestore().collection(CHECKLISTS).where('finished', '==', false);
  const incidencesQuery = uid
    ? firestore()
        .collection(INCIDENCES)
        .where('done', '==', false)
        .where('workersId', 'array-contains', uid)
    : firestore().collection(INCIDENCES).where('done', '==', false);
  const jobsQuery = uid
    ? firestore()
        .collection(JOBS)
        .where('done', '==', false)
        .where('workersId', 'array-contains', uid)
    : firestore().collection(JOBS).where('done', '==', false);

  const [checks] = useCollectionData(checkListsQuery, {
    idField: 'id',
  });

  const [incidences] = useCollectionData(incidencesQuery, {
    idField: 'id',
  });

  const [jobs] = useCollectionData(jobsQuery, {
    idField: 'id',
  });

  console.log("CHECKS", checks)

  return {
    checks: checks?.length,
    incidences: incidences?.length,
    jobs: jobs?.length,
  };
};
