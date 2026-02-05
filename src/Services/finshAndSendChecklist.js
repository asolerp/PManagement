import {
  getFirestore,
  collection,
  doc,
  updateDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

const finishAndSendChecklist = async checkId => {
  try {
    const db = getFirestore();
    const docRef = doc(collection(db, 'checklists'), checkId);
    await updateDoc(docRef, { finished: true, send: true });
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};

export default finishAndSendChecklist;
