//Firebase

import firestore from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

export const getUser = async uuid => {
  try {
    const userRef = await firestore().collection('users').doc(uuid).get();
    return userRef;
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};
