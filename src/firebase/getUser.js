//Firebase

import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

export const getUser = async (uuid) => {
  try {
    return await firestore().collection('users').doc(uuid).get();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
