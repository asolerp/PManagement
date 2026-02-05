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
import {
  getCrashlytics,
  setUserId,
  setAttribute,
  log,
  recordError
} from '@react-native-firebase/crashlytics';

const onAuthStateChange = callback => {
  const auth = getAuth();
  return onAuthStateChanged(auth, user => {
    if (user) {
      const crashlyticsInstance = getCrashlytics();
      // Agregar información del usuario a Crashlytics
      setUserId(crashlyticsInstance, user.uid);
      setAttribute(crashlyticsInstance, 'email', user.email || 'unknown');
      log(crashlyticsInstance, `User authenticated: ${user.uid}`);

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
            console.log('Error getting messaging token:', error);
            const crashlyticsInstance = getCrashlytics();
            recordError(crashlyticsInstance, error);
            log(crashlyticsInstance, 'Error getting messaging token');
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
                    console.error('User document does not exist after update');
                    signOut(auth);
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  console.error('Error updating user document:', error);
                  recordError(crashlyticsInstance, error);
                  log(crashlyticsInstance, 'Error updating user document');

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
              console.warn(
                'User authenticated but no Firestore document found, creating one...'
              );
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
                    console.error('Failed to create user document');
                    signOut(auth);
                    callback({ loggedIn: false });
                  }
                })
                .catch(error => {
                  console.error('Error creating user document:', error);
                  recordError(crashlyticsInstance, error);
                  log(crashlyticsInstance, 'Error creating user document');

                  signOut(auth);
                  callback({ loggedIn: false });
                });
            }
          } catch (error) {
            console.error('Error getting messaging token:', error);
            recordError(crashlyticsInstance, error);
            log(crashlyticsInstance, 'Error getting messaging token');

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
          console.error('Error fetching user document:', error);
          const crashlyticsInstance = getCrashlytics();
          recordError(crashlyticsInstance, error);
          log(
            crashlyticsInstance,
            'Error fetching user document on auth state change'
          );

          // Si hay error al obtener el documento, hacer logout
          signOut(auth);
          callback({ loggedIn: false });
        });
    } else {
      // Limpiar información de Crashlytics al hacer logout
      const crashlyticsInstance = getCrashlytics();
      setUserId(crashlyticsInstance, '');
      setAttribute(crashlyticsInstance, 'email', '');
      log(crashlyticsInstance, 'User logged out');

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
