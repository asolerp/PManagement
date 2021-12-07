import React, {useState} from 'react';

import {useSelector, shallowEqual} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import ProfileBar from '../../components/ProfileBar';
import AddButton from '../../components/Elements/AddButton';

// Utils
import moment from 'moment';

import {ScrollView} from 'react-native';

import {DARK_BLUE} from '../../styles/colors';
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
import IncidencesList from '../../components/Lists/IncidencesList';
import {parseTimeFilter} from '../../utils/parsers';
import {Colors} from '../../Theme/Variables';

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
  const {Layout, Gutters, Fonts} = useTheme();
  const user = useSelector(userSelector, shallowEqual);
  const filters = {
    time: parseTimeFilter('all'),
    state: false,
    type: ['jobs', 'incidences', 'checklists'],
  };
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  const handleNewCheckList = () => {
    openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY);
  };

  return (
    <React.Fragment>
      <AddButton iconName="warning" onPress={() => handleNewCheckList()} />
      <PageLayout safe edges={['top']} withTitle={false}>
        <ScrollView
          style={[Layout.fill, styles.container, Gutters.smallTMargin]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          <ProfileBar />
          <View style={[Gutters.mediumBMargin]}>
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
                <Text style={[Fonts.textRegular, {fontWeight: '400'}]}>
                  Estas son tus tareas en el día de hoy
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.home}>
            <View style={styles.content}>
              {filters.type.some((t) => t === 'checklists') && (
                <ChecklistList
                  uid={user?.id}
                  workers={filters?.workers}
                  houses={filters?.houses}
                  typeFilters={filters?.type}
                  time={filters?.time}
                />
              )}
              {filters.type.some((t) => t === 'incidences') && (
                <IncidencesList
                  uid={user?.id}
                  workers={filters?.workers}
                  houses={filters?.houses}
                  state={filters?.incidenceState}
                  typeFilters={filters.type}
                  time={filters?.time}
                />
              )}
              {filters.type.some((t) => t === 'jobs') && (
                <JobsList
                  uid={user?.id}
                  workers={filters?.workers}
                  houses={filters?.houses}
                  typeFilters={filters.type}
                  time={filters?.time}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </PageLayout>
    </React.Fragment>
  );
};

export default DashboardWorkerScreen;
