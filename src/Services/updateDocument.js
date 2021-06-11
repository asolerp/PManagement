import firestore from '@react-native-firebase/firestore';

const updateDocument = async (collection, docId, update) => {
  try {
    await firestore().collection(collection).doc(docId).update(update);
  } catch (err) {
    return err;
  }
};

export default updateDocument;
