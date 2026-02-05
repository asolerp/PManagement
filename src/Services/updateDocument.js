import {
  getFirestore,
  collection,
  doc,
  updateDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

const updateDocument = async (collectionName, docId, update) => {
  try {
    const db = getFirestore();
    const docRef = doc(collection(db, collectionName), docId);
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

export default updateDocument;
