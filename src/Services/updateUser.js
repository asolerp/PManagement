import firestore from '@react-native-firebase/firestore';

const updateUser = async (uid, update) => {
  try {
    await firestore().collection('users').doc(uid).update(update);
  } catch (err) {
    return err;
  }
};

export default updateUser;
