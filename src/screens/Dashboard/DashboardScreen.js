import React, {useContext, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

// Utils
import moment from 'moment';
import {useTheme} from '../../Theme';

import {TabView, TabBar} from 'react-native-tab-view';

import {FiltersContext} from '../../context/FiltersContext';
import {ActionButtons} from '../../components/Dashboard/ActionButtons';
import {ChecklistsTab} from '../../components/Dashboard/Tabs/ChecklistsTab';
import {IncidencesTab} from '../../components/Dashboard/Tabs/IncidencesTab';
import {JobsTab} from '../../components/Dashboard/Tabs/JobsTab';
import {Colors} from '../../Theme/Variables';
import {GlobalStats} from '../../components/Dashboard/GlobalStats';
import {HousesFilter} from '../../components/Dashboard/HousesFilter';

const DashboardScreen = () => {
  const [index, setIndex] = useState(0);
  const {filters, setFilters} = useContext(FiltersContext);

  const [routes] = useState([
    {key: 'checklists', title: 'Checklists'},
    {key: 'incidences', title: 'Incidencias'},
    {key: 'jobs', title: 'Trabajos'},
  ]);
  const {Layout} = useTheme();

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
      <PageLayout
        statusBar="light-content"
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
            <GlobalStats onPressStat={setIndex} />
            <HousesFilter
              houses={filters.houses}
              onClickHouse={(houses) => {
                setFilters((oldFilters) => ({
                  ...oldFilters,
                  houses,
                }));
              }}
            />
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
