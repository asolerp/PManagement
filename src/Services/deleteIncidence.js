import {
  getFirestore,
  collection,
  doc,
  deleteDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

const deleteIncidence = async incidenceId => {
  try {
    const db = getFirestore();
    const docRef = doc(collection(db, 'incidences'), incidenceId);
    await deleteDoc(docRef);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
    return err;
  }
};

export default deleteIncidence;
