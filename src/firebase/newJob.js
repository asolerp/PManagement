//Firebase

import {
  getFirestore,
  collection,
  addDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

export const newJob = async job => {
  try {
    const db = getFirestore();
    const jobsCollection = collection(db, 'jobs');
    await addDoc(jobsCollection, job);
  } catch (err) {
    error({
      message: 'Algo salió mal, lo sentimos...',
      track: true,
      asToast: true
    });
  }
};
