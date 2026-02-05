import { INCIDENCES } from '../utils/firebaseKeys';
import {
  getFirestore,
  collection,
  doc,
  updateDoc
} from '@react-native-firebase/firestore';

export const asignWorkerToIncidence = async (incidenceId, update) => {
  const db = getFirestore();
  const docRef = doc(collection(db, INCIDENCES), incidenceId);
  await updateDoc(docRef, update);
};
