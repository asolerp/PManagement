import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';
import { JOBS } from '../utils/firebaseKeys';

const duplicateJob = async jobId => {
  try {
    const db = getFirestore();
    const jobRef = doc(collection(db, JOBS), jobId);
    const job = await getDoc(jobRef);

    const duplicatedJob = {
      ...job.data(),
      date: new Date(),
      done: false
    };

    delete duplicatedJob.id;

    const jobsCollection = collection(db, JOBS);
    await addDoc(jobsCollection, duplicatedJob);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};

export default duplicateJob;
