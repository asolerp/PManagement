import React from 'react';

import {useSelector, shallowEqual} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import ProfileBar from '../../components/ProfileBar';

// Utils
import moment from 'moment';

import {ScrollView} from 'react-native';

import {userSelector} from '../../Store/User/userSlice';
import ChecklistList from '../../components/Lists/ChecklistList';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {Colors} from '../../Theme/Variables';
import PageLayout from '../../components/PageLayout';

import {useTheme} from '../../Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    zIndex: 10,
  },
  homeBackScreen: {
    flex: 1,
  },
  home: {
    flex: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: Colors.darkBlue,
    fontWeight: '500',
  },
  checksWrapper: {
    marginBottom: 20,
  },
});

const DashboardOwner = () => {
  const {t} = useTranslation();

  const user = useSelector(userSelector, shallowEqual);
  const {Fonts, Layout, Gutters} = useTheme();
  const [houseOwner] = useCollectionData(
    firestore().collection('houses').where('owner.id', '==', user.uid),
    {
      idField: 'id',
    },
  );

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <PageLayout
      white
      titleChildren={<ProfileBar />}
      titleProps={{
        background: {
          uri: houseOwner?.[0]?.houseImage,
        },
      }}
      titleLefSide={true}>
      <ScrollView
        style={[Layout.fill, styles.container, Gutters.smallTMargin]}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}>
        <View style={styles.home}>
          <View>
            <Text style={[Fonts.textTitle, Gutters.mediumVMargin]}>
              Hoy es {date.join(' ')} ☀️
            </Text>
            <ChecklistList house={houseOwner?.[0]} />
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

export default DashboardOwner;
