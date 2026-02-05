import React, { useContext } from 'react';

// Redux
import { useSelector } from 'react-redux';

import { View, StyleSheet, Dimensions } from 'react-native';

import SignOutRouter from '../Router/signOutRouter';
import Modal from '../components/Modal';

import { userSelector } from '../Store/User/userSlice';

import AdminRouter from '../Router/adminRouter';
import WorkerRouter from '../Router/workerRouter';
import OwnerRouter from '../Router/ownerRouter';
import { useRedirectNotification } from '../lib/notification/notificationHooks';
import { useInAppNotification } from '../lib/notification/useInAppNotification';
import { useAuth } from './hooks/useAuth';
import { LoadingModal } from '../components/Modals/LoadingModal';
import { LoadingModalContext } from '../context/loadinModalContext';

const styles = StyleSheet.create({
  appBackground: {
    flex: 1
  },
  background: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    position: 'absolute',
    resizeMode: 'cover',
    width: '100%'
  },
  contentWrapper: {
    flex: 1
  },
  logo: {
    flex: 1,
    margin: 0,
    marginTop: 40,
    resizeMode: 'contain',
    width: 80
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').height / 10,
    justifyContent: 'flex-start'
  }
});

const getUserSignInStack = role => {
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

  const { visible } = useContext(LoadingModalContext);
  const user = useSelector(userSelector);

  if (!user) {
    return null;
  }

  if (!user?.loggedIn) {
    return <SignOutRouter />;
  }

  return (
    <React.Fragment>
      <Modal />
      <LoadingModal visible={visible} />
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
