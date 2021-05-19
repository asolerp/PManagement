import firestore from '@react-native-firebase/firestore';

const updateChecklistInput = async (checkId, update) => {
  try {
    await firestore().collection('checklists').doc(checkId).update(update);
  } catch (err) {
    return err;
  }
};

export default updateChecklistInput;
