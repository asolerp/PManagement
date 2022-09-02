import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

// Utils
import moment from 'moment';

import {TabView, TabBar} from 'react-native-tab-view';

import {FiltersContext} from '../../context/FiltersContext';
import {ActionButtons} from '../../components/Dashboard/ActionButtons';
import {ChecklistsTab} from '../../components/Dashboard/Tabs/ChecklistsTab';
import {IncidencesTab} from '../../components/Dashboard/Tabs/IncidencesTab';
import {JobsTab} from '../../components/Dashboard/Tabs/JobsTab';
import {Colors} from '../../Theme/Variables';
import {GlobalStats} from '../../components/Dashboard/GlobalStats';
import {HousesFilter} from '../../components/Dashboard/HousesFilter';
import theme from '../../Theme/Theme';
import {HDivider} from '../../components/UI/HDivider';
import Orientation from 'react-native-orientation-locker';

const DashboardScreen = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const {filters, setFilters} = useContext(FiltersContext);

  const [routes] = useState([
    {key: 'checklists', title: 'Checklists'},
    {key: 'incidences', title: 'Incidencias'},
    {key: 'jobs', title: 'Trabajos'},
  ]);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
      Orientation.lockToPortrait();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
        edges={['top']}>
        <ActionButtons />
        <View style={[[theme.flex1]]}>
          <View style={[styles.profileBarContainerStyle]}>
            <ProfileBar />
          </View>
          <View style={[[theme.flex1], styles.container]}>
            <View style={[theme.pX4]}>
              <GlobalStats onPressStat={setIndex} />
            </View>
            <HousesFilter
              houses={filters.houses}
              onClickHouse={(houses) => {
                setFilters((oldFilters) => ({
                  ...oldFilters,
                  houses,
                }));
              }}
            />
            <HDivider style={[theme.mY4]} />
            <View style={[theme.flex1, theme.pX4]}>
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
                initialLayout={{width: layout.width, height: layout.height}}
                sceneContainerStyle={{flex: 1}}
              />
            </View>
          </View>
        </View>
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.greenLight,
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
