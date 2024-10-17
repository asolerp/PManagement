import firestore from '@react-native-firebase/firestore';
import { getEndOfToday, getStartOfToday } from '../../utils/dates';

export const fetchEntrances = async dayOffset => {
  try {
    const snapshot = await firestore()
      .collection('entrances')
      .where('date', '>=', getStartOfToday(dayOffset))
      .where('date', '<=', getEndOfToday(dayOffset))
      .get();

    const houses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return houses;
  } catch (error) {
    console.error('Error fetching houses: ', error);
    throw error; // o manejar el error como prefieras
  }
};
