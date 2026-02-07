import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from '@react-native-firebase/firestore';

import { Logger } from '../../lib/logging';
import { getEndOfToday, getStartOfToday } from '../../utils/dates';

export const fetchEntrances = async dayOffset => {
  try {
    const db = getFirestore();
    const entrancesRef = collection(db, 'entrances');
    const q = query(
      entrancesRef,
      where('date', '>=', getStartOfToday(dayOffset)),
      where('date', '<=', getEndOfToday(dayOffset))
    );
    const snapshot = await getDocs(q);

    const houses = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return houses;
  } catch (error) {
    Logger.error('Error fetching entrances', error, { service: 'entrancesServices' });
    throw error; // o manejar el error como prefieras
  }
};
