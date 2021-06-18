//Firebase

import firestore from '@react-native-firebase/firestore';

export const setMessagesAsRead = async (docId, userId, collection) => {
  // Create a new batch instance
  const batch = firestore().batch();
  console.log('hola desde dentro', docId, collection, userId);
  try {
    const querySnapshot = await firestore()
      .collection(collection)
      .doc(docId)
      .collection('messages')
      .where('user._id', '!=', userId)
      .get();
    querySnapshot.forEach((doc) => {
      console.log(doc);
      const docRef = firestore()
        .collection(collection)
        .doc(docId)
        .collection('messages')
        .doc(doc.id);
      batch.update(docRef, {received: true});
    });

    batch.commit();
  } catch (err) {
    console.log(err);
  }
};
