//Firebase

import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

export const newJob = async (job) => {
  try {
    await firestore().collection('jobs').add(job);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
