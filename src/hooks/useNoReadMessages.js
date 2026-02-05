import { useState, useEffect } from 'react';
import { Platform, UIManager } from 'react-native';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot
} from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { userSelector } from '../Store/User/userSlice';

const useNoReadMessages = ({ collection: collectionName, docId }) => {
  const user = useSelector(userSelector);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noReadCounter, setNoReadCounter] = useState(0);

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const onResult = QuerySnapshot => {
      setLoading(false);
      setNoReadCounter(
        QuerySnapshot.docs
          .map(docSnap => ({ ...docSnap.data(), id: docSnap.id }))
          ?.filter(message => !message?.received?.[user?.id])
          ?.filter(message => message?.user._id !== user.id).length
      );
    };
    const onError = err => {
      setLoading(false);
      setError(err);
    };

    const db = getFirestore();
    const messagesRef = collection(
      doc(collection(db, collectionName), docId),
      'messages'
    );
    const subscriber = onSnapshot(messagesRef, onResult, onError);
    return () => subscriber();
  }, [collectionName, docId, user.id]);

  return {
    loading,
    error,
    noReadCounter
  };
};

export default useNoReadMessages;
