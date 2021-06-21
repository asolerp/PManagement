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
import {
  NEW_INCIDENCE_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import JobsList from '../../components/Lists/JobsList';
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
    borderTopRightRadius: 50,
    flex: 5,
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
  const {Layout, Gutters} = useTheme();
  const user = useSelector(userSelector, shallowEqual);
  const {t} = useTranslation();

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  const handleNewCheckList = () => {
    openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY);
  };

  return (
    <React.Fragment>
      <AddButton iconName="add-alert" onPress={() => handleNewCheckList()} />
      <PageLayout
        titleChildren={
          <ProfileBar onPress={() => openScreenWithPush(PROFILE_SCREEN_KEY)} />
        }
        titleLefSide={true}>
        <ScrollView
          style={[Layout.fill, styles.container, Gutters.smallTMargin]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
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
              <JobsList uid={user.uid} />
            </View>
          </View>
        </ScrollView>
      </PageLayout>
    </React.Fragment>
  );
};

export default DashboardWorkerScreen;
