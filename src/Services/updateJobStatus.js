import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const updateJobStatus = async (jobId, update) => {
  try {
    await firestore().collection('jobs').doc(jobId).update(update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default updateJobStatus;
