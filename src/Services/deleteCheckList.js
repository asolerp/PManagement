import functions from '@react-native-firebase/functions';

const deleteCheckList = async (path) => {
  try {
    const deleteFn = functions().httpsCallable('recursiveDelete');
    await deleteFn(path);
    // await firestore().collection('checklists').doc(checkId).delete();
  } catch (err) {
    console.log(err);
    return err;
  }
};

export default deleteCheckList;
