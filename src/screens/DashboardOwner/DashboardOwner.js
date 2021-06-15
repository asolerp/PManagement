import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector, shallowEqual} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import TitlePage from '../../components/TitlePage';
import ProfileBar from '../../components/ProfileBar';
import AddButton from '../../components/Elements/AddButton';

// Styles
import {defaultLabel, marginBottom, marginTop} from '../../styles/common';

// Utils
import moment from 'moment';

import {ScrollView} from 'react-native';

import {userSelector} from '../../Store/User/userSlice';
import ChecklistList from '../../components/Lists/ChecklistList';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lowGrey,
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
    backgroundColor: Colors.lowGrey,
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
  const navigation = useNavigation();
  const user = useSelector(userSelector, shallowEqual);

  const [houseOwner] = useCollectionData(
    firestore().collection('houses').where('owner.id', '==', user.uid),
    {
      idField: 'id',
    },
  );

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.addButton}>
        <TouchableOpacity onPress={() => navigation.navigate('NewIncidence')}>
          <AddButton iconName="warning" backColor={Colors.pm} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{backgroundColor: Colors.lowGrey}}>
        <TitlePage
          background={{
            uri: houseOwner?.[0]?.houseImage,
          }}>
          <ProfileBar />
        </TitlePage>
        <View style={styles.home}>
          <View style={styles.content}>
            <Text
              style={{
                ...defaultLabel,
                ...marginBottom(10),
                ...marginTop(20),
              }}>
              {t('welcome', {date: date.join(' ')})}
            </Text>
            <Text style={{...styles.label, ...marginBottom(20)}}>
              {t('homeMessage')}
            </Text>
            <ChecklistList house={houseOwner?.[0]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardOwner;
