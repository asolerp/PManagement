//Firebase

import firestore from '@react-native-firebase/firestore';

export const getUser = async (uuid) => {
  try {
    return await firestore().collection('users').doc(uuid).get();
  } catch (err) {
    console.log(err);
  }
};
