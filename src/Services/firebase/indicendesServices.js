import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from '@react-native-firebase/firestore';

import { Logger } from '../../lib/logging';
import { INCIDENCES } from '../../utils/firebaseKeys';

const fetchIncidences = async params => {
  const queryKey = params?.queryKey;

  const uid = queryKey[1];
  const finished = queryKey[2];

  try {
    const db = getFirestore();
    const incidencesRef = collection(db, INCIDENCES);
    let q;

    if (uid) {
      q = query(
        incidencesRef,
        where('done', '==', finished),
        where('workersId', 'array-contains', uid)
      );
    } else {
      q = query(incidencesRef, where('done', '==', finished));
    }

    const snapshot = await getDocs(q);

    const incidences = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return incidences;
  } catch (error) {
    Logger.error('Error fetching incidences', error, { service: 'incidencesServices' });
    throw error; // o manejar el error como prefieras
  }
};

export { fetchIncidences };
