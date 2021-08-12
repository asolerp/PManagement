import functions from '@react-native-firebase/functions';
import {error} from '../lib/logging';

const deleteCheckList = async (path) => {
  try {
    const deleteFn = functions().httpsCallable('recursiveDelete');
    await deleteFn(path);
    // await firestore().collection('checklists').doc(checkId).delete();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default deleteCheckList;
