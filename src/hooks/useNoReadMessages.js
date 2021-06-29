import {useState, useEffect} from 'react';
import {Platform, UIManager} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';

const useNoReadMessages = ({collection, docId}) => {
  const user = useSelector(userSelector);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noReadCounter, setNoReadCounter] = useState(0);

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const onResult = (QuerySnapshot) => {
      setLoading(false);
      setNoReadCounter(
        QuerySnapshot.docs
          .map((doc) => ({...doc.data(), id: doc.id}))
          .filter((message) => !message.received)
          .filter((message) => message.user._id !== user.uid).length,
      );
    };
    const onError = (err) => {
      setLoading(false);
      setError(err);
    };

    const collectionDocs = firestore().collection(collection);
    const doc = collectionDocs.doc(docId);
    const messagesQuery = doc.collection('messages');
    const subscriber = messagesQuery.onSnapshot(onResult, onError);
    return () => subscriber();
  }, [collection, docId, user.uid]);

  return {
    loading,
    error,
    noReadCounter,
  };
};

export default useNoReadMessages;
