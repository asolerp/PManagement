import firestore from '@react-native-firebase/firestore';

const updateIncidenceInput = async (incidenceId, update) => {
  try {
    await firestore().collection('incidences').doc(incidenceId).update(update);
  } catch (err) {
    return err;
  }
};

export default updateIncidenceInput;
