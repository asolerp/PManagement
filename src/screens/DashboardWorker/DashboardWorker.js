import React, {useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

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

import {Colors} from '../../Theme/Variables';
import {GlobalStats} from '../../components/Dashboard/GlobalStats';
import {HousesFilter} from '../../components/Dashboard/HousesFilter';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import theme from '../../Theme/Theme';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {useAnimatedContainer} from '../Dashboard/hooks/useAnimatedContainer';
import {HDivider} from '../../components/UI/HDivider';
import AddButton from '../../components/Elements/AddButton';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CONFIRM_ENTRANCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {useDashboardWorker} from './hooks/useDashboardWorker';
import Badge from '../../components/Elements/Badge';
import {format} from 'date-fns';

export const ENTRANCE_FORMAT = 'HH:mm';

const DashboardWorkerScreen = () => {
  const [index, setIndex] = useState(0);
  const {filters, setFilters} = useContext(FiltersContext);
  const [routes] = useState([
    {key: 'checklists', title: 'Checklists'},
    {key: 'incidences', title: 'Incidencias'},
  ]);
  const {Layout} = useTheme();
  const user = useSelector(userSelector);
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);
  const {isScrollActive, gestureHandler, containerStyles} =
    useAnimatedContainer();
  const layout = useWindowDimensions();
  const {entrance, onRegisterExit} = useDashboardWorker();

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'checklists':
        return (
          <ChecklistsTab filters={filters} scrollEnabled={isScrollActive} />
        );
      case 'incidences':
        return (
          <IncidencesTab filters={filters} scrollEnabled={isScrollActive} />
        );
      default:
        return null;
    }
  };

  if (entrance) {
    console.log('entrance', entrance);
  }

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
        edges={['top']}>
        <ActionButtons />
        <AddButton
          containerStyle={[theme.left5]}
          iconName="house"
          onPress={() => openScreenWithPush(CONFIRM_ENTRANCE_SCREEN_KEY)}
        />
        <View style={[[theme.flex1, theme.bgGray100]]}>
          <View style={[styles.profileBarContainerStyle]}>
            <ProfileBar />
          </View>
          <View style={[[theme.flex1], styles.container]}>
            <View style={[theme.pX4]}>
              <GlobalStats onPressStat={setIndex} uid={user?.id} />
            </View>
            {entrance && (
              <View
                style={[
                  theme.h28,
                  theme.flexRow,
                  theme.itemsCenter,
                  theme.justifyBetween,
                  theme.flexWrap,
                  theme.bgWhite,
                  theme.mX4,
                  theme.mB2,
                  theme.p4,
                  theme.shadowXl,
                  theme.borderGray400,
                  {borderRadius: 6, borderWidth: 1},
                ]}>
                <View>
                  <Text style={[theme.mB1]}>Trabajando en: </Text>
                  <Text style={[theme.fontSansBold]}>
                    {entrance.house.houseName}
                  </Text>
                  <View style={[theme.flexRow, theme.mT2, theme.itemsCenter]}>
                    <Text style={[theme.mR1]}>Hora de entrada:</Text>
                    <Badge
                      text={format(
                        entrance?.date?.seconds * 1000 +
                          entrance?.date?.nanoseconds / 1000000,
                        'HH:mm',
                      )}>
                      {}
                    </Badge>
                  </View>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => onRegisterExit(entrance.id)}
                    style={[
                      theme.bgError,
                      theme.wFull,
                      theme.hFull,
                      theme.p4,
                      theme.roundedSm,
                      theme.itemsCenter,
                      theme.justifyCenter,
                    ]}>
                    <Text style={[theme.textWhite]}>Marcar salida</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View
                style={[
                  theme.flexGrow,
                  theme.bgGray100,
                  theme.pX4,
                  containerStyles,
                ]}>
                <View style={[theme.itemsCenter, theme.mT2]}>
                  <View
                    style={[
                      theme.w8,
                      theme.h2,
                      theme.bgGray200,
                      theme.roundedSm,
                    ]}
                  />
                </View>
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
              </Animated.View>
            </PanGestureHandler>
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

export default DashboardWorkerScreen;
