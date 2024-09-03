import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { REGION } from '../firebase/utils';

const deleteCheckList = async path => {
  try {
    const deleteFn = firebase
      .app()
      .functions(REGION)
      .httpsCallable('recursiveDelete');
    await deleteFn(path);
    // await firestore().collection('checklists').doc(checkId).delete();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
    return err;
  }
};

export default deleteCheckList;
