import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import {useSelector} from 'react-redux';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {userSelector} from '../Store/User/userSlice';

import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import {capitalizeText} from '../utils/capitalize';
import {openScreenWithPush} from '../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../Router/utils/routerKeys';

const ProfileBar = () => {
  const {Fonts} = useTheme();
  const defaultImg =
    'https://res.cloudinary.com/enalbis/image/upload/v1645959807/PortManagement/varios/Captura_de_pantalla_2022-02-27_a_las_12.02.44_vttcma.jpg';

  const user = useSelector(userSelector);
  const [userProfile, setUserProfile] = useState();

  const today = format(new Date(), 'iii d MMMM yyyy', {locale: es});

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
          <Text style={[Fonts.textXl, Fonts.textBold, {color: Colors.white}]}>
            Hola {user.firstName || ''}
          </Text>
          <Text style={[Fonts.textXs, {color: Colors.gray300}]}>
            {capitalizeText(today)}
          </Text>
        </View>

        <View>
          <TouchableOpacity
            onPress={() =>
              openScreenWithPush(PROFILE_SCREEN_KEY, {
                userId: user?.id,
              })
            }>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    height: 200,
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

{
  /* <View style={[Gutters.mediumBMargin]}>
  <View
    style={[
      Layout.row,
      Layout.alignItemsCenter,
      Layout.justifyContentSpaceBetween,
    ]}>
    <View>
      <Text style={[Fonts.textRegular, {color: Colors.pm}]}>
        Hola {user.firstName || '' + '.'}
      </Text>
      <Text style={[Fonts.textRegular, {width: 200, fontWeight: '400'}]}>
        Estas son tus tareas en el día de hoy
      </Text>
    </View>
    <TouchableWithoutFeedback
      onPress={() => openScreenWithPush(FILTERS_SCREEN_KEY)}>
      <View style={[Layout.row, Layout.alignItemsCenter]}>
        <Icon name="filter-alt" size={15} style={[Gutters.tinyRMargin]} />
        <Text style={[Fonts.textTitle]}>{t('common.filters.title')}</Text>
      </View>
    </TouchableWithoutFeedback>
  </View>
</View>; */
}
