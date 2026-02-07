import { useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { logUser } from '../../Store/User/userSlice';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from '@react-native-firebase/firestore';
import {
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages
} from '@react-native-firebase/messaging';
import { Logger } from '../../lib/logging';

const onAuthStateChange = callback => {
  const auth = getAuth();
  return onAuthStateChanged(auth, user => {
    if (user) {
      // Set user context for Crashlytics
      Logger.setUser({
        id: user.uid,
        email: user.email
      });
      Logger.info('User authenticated', { userId: user.uid });

      const db = getFirestore();
      const docRef = doc(collection(db, 'users'), user.uid);

      getDoc(docRef)
        .then(async docSnapshot => {
          let token = null;
          try {
            const messaging = getMessaging();
            // Verificar si el dispositivo está registrado para mensajes remotos
            const isRegistered = isDeviceRegisteredForRemoteMessages(messaging);

            if (!isRegistered) {
              // Registrar el dispositivo para iOS
              await registerDeviceForRemoteMessages(messaging);
            }

            // Intentar obtener el token
            token = await getToken(messaging);
          } catch (error) {
            // Si falla el token, continuar sin él (común en desarrollo)
            Logger.warn('Error getting messaging token', { error: error.message });
          }

          try {
            if (docSnapshot.exists()) {
              const updateData = { email: user.email };
              if (token) {
                updateData.token = token;
              }

              updateDoc(docRef, updateData)
                .then(() => getDoc(docRef))
                .then(docSnap => {
                  if (docSnap.exists()) {
                    callback({
                      loggedIn: true,
                      id: docSnap.id,
                      token,
                      ...docSnap.data()
                    });
                  } else {
                    // Documento no existe después de actualizar, hacer logout
                    Logger.error('User document does not exist after update', null, { userId: user.uid });
                    signOut(auth);
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  Logger.error('Error updating user document', error, { userId: user.uid });

                  // Si falla la actualización, intentar obtener el documento directamente
                  getDoc(docRef)
                    .then(docSnap => {
                      if (docSnap.exists()) {
                        callback({
                          loggedIn: true,
                          id: docSnap.id,
                          ...docSnap.data()
                        });
                      } else {
                        signOut(auth);
                        callback({ loggedIn: false });
                      }
                    })
                    .catch(() => {
                      signOut(auth);
                      callback({ loggedIn: false });
                    });
                });
            } else {
              // Usuario autenticado pero sin documento en Firestore
              Logger.warn('User authenticated but no Firestore document found, creating one', {
                userId: user.uid
              });
              const newUserData = {
                email: user.email,
                photoURL: user.photoURL
              };
              if (token) {
                newUserData.token = token;
              }

              setDoc(docRef, newUserData)
                .then(() => getDoc(docRef))
                .then(docSnap => {
                  if (docSnap.exists()) {
                    callback({
                      loggedIn: true,
                      id: docSnap.id,
                      ...docSnap.data()
                    });
                  } else {
                    Logger.error('Failed to create user document', null, { userId: user.uid });
                    signOut(auth);
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  Logger.error('Error creating user document', error, { userId: user.uid });
                  signOut(auth);
                  callback({ loggedIn: false });
                });
            }
          } catch (error) {
            Logger.error('Error in user auth flow', error, { userId: user.uid });

            // Si falla el token de messaging, intentar sin él
            if (docSnapshot.exists()) {
              callback({
                loggedIn: true,
                id: docSnapshot.id,
                ...docSnapshot.data()
              });
            } else {
              signOut(auth);
              callback({ loggedIn: false });
            }
          }
        })
        .catch(error => {
          Logger.error('Error fetching user document on auth state change', error);

          // Si hay error al obtener el documento, hacer logout
          signOut(auth);
          callback({ loggedIn: false });
        });
    } else {
      // Limpiar información de Crashlytics al hacer logout
      Logger.clearUser();
      Logger.info('User logged out');

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
