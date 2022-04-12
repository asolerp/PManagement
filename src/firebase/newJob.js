//Firebase

import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

export const newJob = async (job) => {
  try {
    await firestore().collection('jobs').add(job);
  } catch (err) {
    console.log(err);
    error({
      message: 'Algo salió mal, lo sentimos...',
      track: true,
      asToast: true,
    });
  }
};
