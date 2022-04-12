import React, {useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StatusBar,
} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utils
import moment from 'moment';
import {useTheme} from '../../Theme';
import {openScreenWithPush} from '../../Router/utils/actions';
import {FILTERS_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {TabView, TabBar} from 'react-native-tab-view';

import {FiltersContext} from '../../context/FiltersContext';
import {ActionButtons} from '../../components/Dashboard/ActionButtons';
import {ChecklistsTab} from '../../components/Dashboard/Tabs/ChecklistsTab';
import {IncidencesTab} from '../../components/Dashboard/Tabs/IncidencesTab';
import {JobsTab} from '../../components/Dashboard/Tabs/JobsTab';
import {Colors} from '../../Theme/Variables';

const DashboardScreen = () => {
  const [index, setIndex] = useState(0);
  const {t} = useTranslation();
  const [routes] = useState([
    {key: 'checklists', title: 'Checklists'},
    {key: 'incidences', title: 'Incidencias'},
    {key: 'jobs', title: 'Trabajos'},
  ]);
  const {Layout, Gutters, Fonts} = useTheme();

  const {filters} = useContext(FiltersContext);
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  const layout = useWindowDimensions();

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'checklists':
        return <ChecklistsTab filters={filters} />;
      case 'incidences':
        return <IncidencesTab filters={filters} />;
      case 'jobs':
        return <JobsTab filters={filters} />;
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <PageLayout
        withTitle={false}
        withPadding={false}
        containerStyles={{backgroundColor: Colors.gray100}}>
        <ActionButtons />
        <View style={[Layout.grow]}>
          <View style={[styles.profileBarContainerStyle]}>
            <ProfileBar />
          </View>

          {/* <TouchableWithoutFeedback
            onPress={() => openScreenWithPush(FILTERS_SCREEN_KEY)}>
            <View style={[Layout.row, Layout.alignItemsCenter]}>
              <Icon name="filter-alt" size={15} style={[Gutters.tinyRMargin]} />
              <Text style={[Fonts.textTitle]}>{t('common.filters.title')}</Text>
            </View>
          </TouchableWithoutFeedback> */}

          <View style={[Layout.grow, styles.container]}>
            <View style={[styles.statsContainerStyle]} />
            <TabView
              renderTabBar={(props) => (
                <TabBar
                  {...props}
                  style={styles.tabBarContainerStyle}
                  indicatorStyle={styles.indicatorStyle}
                  renderLabel={({route, focused}) => {
                    return (
                      <Text
                        style={[
                          {color: focused ? Colors.pm : Colors.gray800},
                          styles.tabTextStyle,
                        ]}>
                        {route.title}
                      </Text>
                    );
                  }}
                />
              )}
              navigationState={{index, routes}}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{width: layout.width}}
              style={[Layout.fill]}
            />
          </View>
        </View>
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  statsContainerStyle: {
    marginTop: -30,
    marginBottom: 10,
    height: 70,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: '#4f4f4f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.pm,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  tabBarContainerStyle: {
    backgroundColor: null,
  },
  indicatorStyle: {
    backgroundColor: Colors.pm,
    height: 5,
    borderRadius: 5,
  },
  tabTextStyle: {
    fontWeight: '500',
  },
});

export default DashboardScreen;
