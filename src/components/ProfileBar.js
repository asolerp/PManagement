import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {userSelector} from '../Store/User/userSlice';

const ProfileBar = ({onPress}) => {
  const user = useSelector(userSelector);
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .doc(user?.uid)
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
          <Text style={styles.welcome}>Hola!</Text>
          <Text style={styles.userName}>{userProfile?.firstName}</Text>
        </View>
        <View>
          <TouchableOpacity onPress={onPress}>
            <Image
              style={styles.avatar}
              source={{
                uri: userProfile?.profileImage,
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
    padding: 10,
    marginBottom: 20,
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    resizeMode: 'cover',
  },
  welcome: {
    fontSize: 30,
    color: 'white',
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ProfileBar;
