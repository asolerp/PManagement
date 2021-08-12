import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const updateIncidenceInput = async (incidenceId, update) => {
  try {
    await firestore().collection('incidences').doc(incidenceId).update(update);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
    return err;
  }
};

export default updateIncidenceInput;
