import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';
import TitlePage from '../../components/TitlePage';
import IncidencesList from '../../components/Lists/IncidencesList';

// UI
import PageLayout from '../../components/PageLayout';
import LinearGradient from 'react-native-linear-gradient';

// Utils
import moment from 'moment';
import {ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import ChecklistList from '../../components/Lists/ChecklistList';
import {openScreenWithPush} from '../../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../Profile';

export const DASHBOARD_SCREEN_KEY = 'dashboardScreen';

const DashboardScreen = () => {
  const {Layout, Gutters, Fonts} = useTheme();

  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <PageLayout
      titleChildren={
        <ProfileBar onPress={() => openScreenWithPush(PROFILE_SCREEN_KEY)} />
      }
      titleLefSide={true}>
      <ScrollView
        style={[Layout.fill, styles.container]}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}>
        <View style={styles.home}>
          <View>
            <Text style={[Fonts.textTitle, Gutters.mediumVMargin]}>
              Hoy es {date.join(' ')} ☀️
            </Text>
            <ChecklistList />
            <IncidencesList />
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lowGrey,
    borderTopRightRadius: 50,
  },
  home: {
    backgroundColor: Colors.lowGrey,
    flex: 5,
  },
});

export default DashboardScreen;
