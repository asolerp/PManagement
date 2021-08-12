import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const deleteIncidence = async (incidenceId) => {
  try {
    await firestore().collection('incidences').doc(incidenceId).delete();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default deleteIncidence;
