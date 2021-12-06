//Firebase

import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

export const setMessagesAsRead = async (docId, userId, collection) => {
  console.log(docId, userId, collection);
  // Create a new batch instance
  const batch = firestore().batch();
  try {
    const querySnapshot = await firestore()
      .collection(collection)
      .doc(docId)
      .collection('messages')
      .where('user._id', '!=', userId)
      .get();
    querySnapshot.forEach((doc) => {
      const docRef = firestore()
        .collection(collection)
        .doc(docId)
        .collection('messages')
        .doc(doc.id);
      batch.update(docRef, {
        received: {...doc.data().received, [userId]: true},
      });
    });

    batch.commit();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
