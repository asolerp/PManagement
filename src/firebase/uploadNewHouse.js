import {
  getFirestore,
  collection,
  addDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

export const newHouse = async data => {
  try {
    const db = getFirestore();
    const housesCollection = collection(db, 'houses');
    const result = await addDoc(housesCollection, data);
    console.log('[[RESULT]]', result);
    return result.id;
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};
