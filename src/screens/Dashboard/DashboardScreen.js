import React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';
import JobsList from '../../components/Lists/JobsList';
import IncidencesList from '../../components/Lists/IncidencesList';
import ChecklistList from '../../components/Lists/ChecklistList';

// UI
import PageLayout from '../../components/PageLayout';

// Utils
import moment from 'moment';
import {useTheme} from '../../Theme';
import {openScreenWithPush} from '../../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';

const DashboardScreen = () => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
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
          <View>
            <Text style={[Fonts.textTitle, Gutters.mediumVMargin]}>
              {t('welcome', {date: date.join(' ')})}
            </Text>
            <ChecklistList />
            <IncidencesList />
            <JobsList />
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {},
  home: {
    flex: 5,
  },
});

export default DashboardScreen;
