//Firebase

import {
  getFirestore,
  collection,
  doc,
  getDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

export const getUser = async uuid => {
  try {
    const db = getFirestore();
    const userRef = doc(collection(db, 'users'), uuid);
    const userDoc = await getDoc(userRef);
    return userDoc;
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};
