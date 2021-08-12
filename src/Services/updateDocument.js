import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const updateDocument = async (collection, docId, update) => {
  try {
    await firestore().collection(collection).doc(docId).update(update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default updateDocument;
