import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const updateUser = async (uid, update) => {
  try {
    await firestore().collection('users').doc(uid).update(update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default updateUser;
