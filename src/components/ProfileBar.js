import React, {useMemo} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

// Firebase
import firestore from '@react-native-firebase/firestore';

import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import {capitalizeText} from '../utils/capitalize';
import {openScreenWithPush} from '../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../Router/utils/routerKeys';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';
import {DEFAULT_IMAGE} from '../constants/general';

const ProfileBar = () => {
  const {Fonts} = useTheme();

  const user = useSelector(userSelector);
  const today = format(new Date(), 'iii d MMMM yyyy', {locale: es});

  const firestoreQuery = useMemo(
    () => firestore().collection('users').doc(user?.id),
    [user?.id],
  );

  const [userProfile] = useDocumentData(firestoreQuery, {
    idField: 'id',
  });

  return (
    <View style={styles.container}>
      <View style={styles.profileBar}>
        <View>
          <Text style={[Fonts.textXl, Fonts.textBold, {color: Colors.white}]}>
            Hola {userProfile?.firstName || ''}
          </Text>
          <Text style={[Fonts.textXs, {color: Colors.gray300}]}>
            {capitalizeText(today)}
          </Text>
        </View>

        <View>
          <TouchableOpacity
            onPress={() =>
              userProfile?.role === 'admin' &&
              openScreenWithPush(PROFILE_SCREEN_KEY, {
                mode: 'admin',
                user: userProfile,
              })
            }>
            <Image
              style={styles.avatar}
              source={{
                uri: userProfile?.profileImage?.original || DEFAULT_IMAGE,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    height: 150,
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatar: {
    width: 60,
    height: 60,
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
