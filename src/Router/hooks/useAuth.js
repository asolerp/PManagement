import {useEffect, useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import {logUser} from '../../Store/User/userSlice';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const onAuthStateChange = (callback) => {
  return auth().onAuthStateChanged((user) => {
    if (user) {
      let docRef = firestore().collection('users').doc(user.uid);
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(async (docSnapshot) => {
          let token = await messaging().getToken();
          if (docSnapshot.exists) {
            docRef
              .update({email: user.email, token})
              .then(() => docRef.get())
              .then((doc) => {
                if (doc.exists) {
                  callback({loggedIn: true, id: doc.id, token, ...doc.data()});
                }
              });
          } else {
            docRef
              .set({email: user.email, photoURL: user.photoURL})
              .then(() => docRef.get())
              .then((doc) => {
                if (doc.exists) {
                  callback({loggedIn: true, id: doc.id, ...doc.data()});
                }
              });
          }
        });
    } else {
      callback({loggedIn: false});
    }
  });
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const setUser = useCallback((user) => dispatch(logUser({user})), [dispatch]);

  useEffect(() => {
    const authSubscriber = onAuthStateChange(setUser);
    return authSubscriber;
  }, []);
};
