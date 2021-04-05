//Firebase

import firestore from '@react-native-firebase/firestore';

export const newJob = async (job) => {
  try {
    await firestore().collection('jobs').add(job);
  } catch (err) {
    console.log(err);
  }
};
