import { useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { logUser } from '../../Store/User/userSlice';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';

const onAuthStateChange = callback => {
  return auth().onAuthStateChanged(user => {
    if (user) {
      // Agregar información del usuario a Crashlytics
      crashlytics().setUserId(user.uid);
      crashlytics().setAttribute('email', user.email || 'unknown');
      crashlytics().log(`User authenticated: ${user.uid}`);

      let docRef = firestore().collection('users').doc(user.uid);
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(async docSnapshot => {
          try {
            let token = await messaging().getToken();
            if (docSnapshot.exists) {
              docRef
                .update({ email: user.email, token })
                .then(() => docRef.get())
                .then(doc => {
                  if (doc.exists) {
                    callback({
                      loggedIn: true,
                      id: doc.id,
                      token,
                      ...doc.data()
                    });
                  } else {
                    // Documento no existe después de actualizar, hacer logout
                    console.error('User document does not exist after update');
                    auth().signOut();
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  console.error('Error updating user document:', error);
                  crashlytics().recordError(error);
                  crashlytics().log('Error updating user document');

                  // Si falla la actualización, intentar obtener el documento directamente
                  docRef
                    .get()
                    .then(doc => {
                      if (doc.exists) {
                        callback({ loggedIn: true, id: doc.id, ...doc.data() });
                      } else {
                        auth().signOut();
                        callback({ loggedIn: false });
                      }
                    })
                    .catch(() => {
                      auth().signOut();
                      callback({ loggedIn: false });
                    });
                });
            } else {
              // Usuario autenticado pero sin documento en Firestore
              console.warn(
                'User authenticated but no Firestore document found, creating one...'
              );
              docRef
                .set({ email: user.email, photoURL: user.photoURL, token })
                .then(() => docRef.get())
                .then(doc => {
                  if (doc.exists) {
                    callback({ loggedIn: true, id: doc.id, ...doc.data() });
                  } else {
                    console.error('Failed to create user document');
                    auth().signOut();
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  console.error('Error creating user document:', error);
                  crashlytics().recordError(error);
                  crashlytics().log('Error creating user document');

                  auth().signOut();
                  callback({ loggedIn: false });
                });
            }
          } catch (error) {
            console.error('Error getting messaging token:', error);
            crashlytics().recordError(error);
            crashlytics().log('Error getting messaging token');

            // Si falla el token de messaging, intentar sin él
            if (docSnapshot.exists) {
              callback({
                loggedIn: true,
                id: docSnapshot.id,
                ...docSnapshot.data()
              });
            } else {
              auth().signOut();
              callback({ loggedIn: false });
            }
          }
        })
        .catch(error => {
          console.error('Error fetching user document:', error);
          crashlytics().recordError(error);
          crashlytics().log(
            'Error fetching user document on auth state change'
          );

          // Si hay error al obtener el documento, hacer logout
          auth().signOut();
          callback({ loggedIn: false });
        });
    } else {
      // Limpiar información de Crashlytics al hacer logout
      crashlytics().setUserId('');
      crashlytics().setAttribute('email', '');
      crashlytics().log('User logged out');

      callback({ loggedIn: false });
    }
  });
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const setUser = useCallback(user => dispatch(logUser({ user })), [dispatch]);

  useEffect(() => {
    const authSubscriber = onAuthStateChange(setUser);
    return authSubscriber;
  }, []);
};
