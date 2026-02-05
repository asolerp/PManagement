//Firebase

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from '@react-native-firebase/firestore';
import { error } from '../lib/logging';

export const setMessagesAsRead = async (docId, userId, collectionName) => {
  try {
    const db = getFirestore();
    // Create a new batch instance
    const batch = writeBatch(db);

    const messagesCollection = collection(
      doc(collection(db, collectionName), docId),
      'messages'
    );
    const q = query(messagesCollection, where('user._id', '!=', userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(docSnap => {
      const docRef = doc(messagesCollection, docSnap.id);
      batch.update(docRef, {
        received: { ...docSnap.data().received, [userId]: true }
      });
    });

    await batch.commit();
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
  }
};
