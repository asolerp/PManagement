import firestore from '@react-native-firebase/firestore';

const deleteIncidence = async (incidenceId) => {
  try {
    await firestore().collection('incidences').doc(incidenceId).delete();
  } catch (err) {
    return err;
  }
};

export default deleteIncidence;
