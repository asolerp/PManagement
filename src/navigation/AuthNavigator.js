import React, {useState, useEffect, useCallback} from 'react';

// Redux
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {View, StyleSheet, StatusBar, Dimensions} from 'react-native';

import SignInStack from './SignInStack';
import SignOutStack from './SignOutStack';
import Modal from '../components/Modal';

//Firebase
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {getUser} from '../firebase/getUser';
import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import SignInWorkerStack from './Worker/SignInWorkerStack';
import {logUser, userSelector} from '../Store/User/userSlice';
import Loading from '../components/Loading';
import {loadingSelector} from '../Store/App/appSlice';

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
  },
  topBar: {
    height: Dimensions.get('window').height / 10,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-start',
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentWrapper: {
    flex: 1,
  },
  logo: {
    flex: 1,
    width: 80,
    resizeMode: 'contain',
    margin: 0,
    marginTop: 40,
  },
});

const getUserSignInStack = (role) => {
  if (role === 'admin') {
    return <SignInStack />;
  } else {
    return <SignInWorkerStack />;
  }
};

const AuthNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const dispatch = useDispatch();

  const {updateFirebase} = useUpdateFirebase('users');
  const loading = useSelector(loadingSelector);
  const user = useSelector(userSelector, shallowEqual);
  const setUser = useCallback((user) => dispatch(logUser({user})), [dispatch]);

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    async (result) => {
      try {
        if (result) {
          const usuario = await getUser(result?.uid);
          if (usuario.data()) {
            setUser({...usuario.data(), uid: result.uid});
            console.log(await messaging().getToken());
            updateFirebase(`${result.uid}`, {
              token: await messaging().getToken(),
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (initializing) {
          setInitializing(false);
        }
      }
    },
    [initializing, setUser],
  );

  useEffect(() => {
    const authSubscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return authSubscriber;
  }, [onAuthStateChanged]);

  if (initializing) {
    return null;
  }

  return user?.uid ? (
    <React.Fragment>
      {loading && <Loading />}
      <Modal />
      <StatusBar barStyle="light-content" />
      <View style={styles.appBackground}>
        <View style={styles.background}>
          <View style={styles.contentWrapper}>
            {getUserSignInStack(user?.role)}
          </View>
        </View>
      </View>
    </React.Fragment>
  ) : (
    <SignOutStack />
  );
};

export default React.memo(AuthNavigator);
