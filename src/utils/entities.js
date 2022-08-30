import firestore from '@react-native-firebase/firestore';

const HOUSES_COLLECTION = 'houses';
const QUADRANTS_COLLECTION = 'quadrants';

export const HOUSES = firestore().collection(HOUSES_COLLECTION);
export const QUADRANTS_QUERY = firestore().collection(QUADRANTS_COLLECTION);
