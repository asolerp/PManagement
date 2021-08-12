import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const updateChecklistInput = async (checkId, update) => {
  try {
    await firestore().collection('checklists').doc(checkId).update(update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default updateChecklistInput;
