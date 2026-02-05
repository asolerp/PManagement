import {
  getFirestore,
  collection,
  doc,
  updateDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

const updateUser = async (uid, update) => {
  try {
    const db = getFirestore();
    const docRef = doc(collection(db, 'users'), uid);
    await updateDoc(docRef, update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
    return err;
  }
};

export default updateUser;
