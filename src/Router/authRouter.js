import React from 'react';

// Redux
import {useSelector} from 'react-redux';

import {View, StyleSheet, Dimensions} from 'react-native';

import SignOutRouter from '../Router/signOutRouter';
import Modal from '../components/Modal';

import {userSelector} from '../Store/User/userSlice';

import AdminRouter from '../Router/adminRouter';
import WorkerRouter from '../Router/workerRouter';
import OwnerRouter from '../Router/ownerRouter';
import {useRedirectNotification} from '../lib/notification/notificationHooks';
import {useInAppNotification} from '../lib/notification/useInAppNotification';
import {useAuth} from './hooks/useAuth';

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
    return <AdminRouter />;
  }
  if (role === 'worker') {
    return <WorkerRouter />;
  }
  if (role === 'owner') {
    return <OwnerRouter />;
  }
  return;
};

const AuthRouter = () => {
  useRedirectNotification();
  useInAppNotification();
  useAuth();

  const user = useSelector(userSelector);

  console.log('user', user);

  if (!user) {
    return null;
  }

  if (!user?.loggedIn) {
    return <SignOutRouter />;
  }

  return (
    <React.Fragment>
      <Modal />
      <View style={styles.appBackground}>
        <View style={styles.background}>
          <View style={styles.contentWrapper}>
            {getUserSignInStack(user?.role)}
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

export default React.memo(AuthRouter);
