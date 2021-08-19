import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const finishAndSendChecklist = async (checkId) => {
  try {
    await firestore()
      .collection('checklists')
      .doc(checkId)
      .update({finished: true, send: true});
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};

export default finishAndSendChecklist;
