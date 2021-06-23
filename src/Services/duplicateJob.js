import firestore from '@react-native-firebase/firestore';
import {JOBS} from '../utils/firebaseKeys';

const duplicateJob = async (jobId) => {
  try {
    const job = await firestore().collection(JOBS).doc(jobId).get();

    const duplicatedJob = {
      ...job._data,
      date: new Date(),
      done: false,
    };

    delete duplicatedJob.id;

    await firestore().collection(JOBS).add(duplicatedJob);
  } catch (err) {
    console.log(err);
  }
};

export default duplicateJob;
