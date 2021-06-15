import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector, shallowEqual} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import TitlePage from '../../components/TitlePage';
import ProfileBar from '../../components/ProfileBar';
import AddButton from '../../components/Elements/AddButton';

// UI
import LinearGradient from 'react-native-linear-gradient';

// Styles
import {defaultLabel, marginBottom, marginTop} from '../../styles/common';

// Utils
import moment from 'moment';

import {ScrollView} from 'react-native';

import {DARK_BLUE, LOW_GREY} from '../../styles/colors';
import {userSelector} from '../../Store/User/userSlice';
import ChecklistList from '../../components/Lists/ChecklistList';
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';

const styles = StyleSheet.create({
  container: {
    backgroundColor: LOW_GREY,
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
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
    flex: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: DARK_BLUE,
    fontWeight: '500',
  },
  checksWrapper: {
    marginBottom: 20,
  },
});

const DashboardWorkerScreen = () => {
  const user = useSelector(userSelector, shallowEqual);
  const {t} = useTranslation();

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.addButton}>
        <TouchableOpacity
          onPress={() => openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY)}>
          <AddButton iconName="add-alert" backColor="#F5C66D" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{backgroundColor: LOW_GREY}}>
        <TitlePage>
          <ProfileBar />
        </TitlePage>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#126D9B', '#67B26F']}
          style={styles.homeBackScreen}>
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
              <ChecklistList uid={user.uid} />
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default DashboardWorkerScreen;
