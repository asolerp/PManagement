import { getFirestore, collection } from '@react-native-firebase/firestore';

const HOUSES_COLLECTION = 'houses';
const QUADRANTS_COLLECTION = 'quadrants';

const db = getFirestore();
export const HOUSES = collection(db, HOUSES_COLLECTION);
export const QUADRANTS_QUERY = collection(db, QUADRANTS_COLLECTION);
