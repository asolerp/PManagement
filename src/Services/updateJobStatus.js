import firestore from '@react-native-firebase/firestore';

const updateJobStatus = async (jobId, update) => {
  try {
    await firestore().collection('jobs').doc(jobId).update(update);
  } catch (err) {
    return err;
  }
};

export default updateJobStatus;
