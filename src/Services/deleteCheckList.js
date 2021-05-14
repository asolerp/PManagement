import firestore from '@react-native-firebase/firestore';

const deleteCheckList = async (checkId) => {
  try {
    await firestore()
      .collection('checklists')
      .doc(checkId)
      .collection('checks')
      .delete();
    await firestore().collection('checklists').doc(checkId).delete();
  } catch (err) {
    return err;
  }
};

export default deleteCheckList;
