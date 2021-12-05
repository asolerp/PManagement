import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {userSelector} from '../Store/User/userSlice';
import {useTranslation} from 'react-i18next';

const ProfileBar = ({onPress}) => {
  const defaultImg =
    'https://res.cloudinary.com/enalbis/image/upload/v1629876203/PortManagement/varios/avatar-1577909_1280_gcinj5.png';

  const user = useSelector(userSelector);
  const [userProfile, setUserProfile] = useState();
  const {t} = useTranslation();
  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .doc(user?.id)
      .onSnapshot((documentSnapshot) => {
        setUserProfile(documentSnapshot?.data());
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.profileBar}>
        <View>
          <Image
            style={styles.tinyLogo}
            source={require('../assets/images/logo_pm_color.png')}
          />
        </View>
        <View>
          <TouchableOpacity onPress={onPress}>
            <Image
              style={styles.avatar}
              source={{
                uri: userProfile?.profileImage || defaultImg,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    resizeMode: 'cover',
  },
  welcome: {
    fontSize: 30,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  tinyLogo: {
    width: 80,
    resizeMode: 'contain',
  },
});

export default ProfileBar;
