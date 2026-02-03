import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

import { TabView, TabBar } from 'react-native-tab-view';

import { ActionButtons } from '../../components/Dashboard/ActionButtons';
import AddButton from '../../components/Elements/AddButton';

import { Colors } from '../../Theme/Variables';
import { GlobalStats } from '../../components/Dashboard/GlobalStats';
import { HousesFilter } from '../../components/Dashboard/HousesFilter';
import theme from '../../Theme/Theme';
import { HDivider } from '../../components/UI/HDivider';

import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { RECYCLE_BIN_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { openScreenWithPush } from '../../Router/utils/actions';
import { useDashboard } from './hooks/useDashboard';
import { CRASHLYTICS_TEST_SCREEN_KEY } from '../CrashlyticsTest';

const DashboardScreen = ({ navigation }) => {
  const {
    index,
    routes,
    layout,
    filters,
    setIndex,
    setFilters,
    renderScene,
    gestureHandler,
    containerStyles
  } = useDashboard(navigation);

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
        edges={['top']}
      >
        <AddButton
          containerStyle={[theme.left5]}
          iconName="restore-from-trash"
          onPress={() => openScreenWithPush(RECYCLE_BIN_SCREEN_KEY)}
        />
        {/* ⚠️ TEMPORAL: Botón para probar Crashlytics - ELIMINAR EN PRODUCCIÓN */}
        <AddButton
          containerStyle={[theme.left5, { bottom: 100 }]}
          iconName="bug-report"
          onPress={() => openScreenWithPush(CRASHLYTICS_TEST_SCREEN_KEY)}
        />
        <ActionButtons />
        <View style={[theme.flex1, theme.bgGray100]}>
          <View style={styles.profileBarContainerStyle}>
            <ProfileBar />
          </View>
          <View style={[[theme.flex1], styles.container]}>
            <View style={theme.pX4}>
              <GlobalStats onPressStat={setIndex} />
            </View>
            <HousesFilter
              houses={filters.houses}
              onClickHouse={houses => {
                setFilters(oldFilters => ({
                  ...oldFilters,
                  houses
                }));
              }}
            />
            <HDivider style={theme.mY4} />
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View
                style={[
                  theme.flexGrow,
                  theme.bgGray100,
                  // theme.bgWarning,
                  theme.pX4,
                  containerStyles
                ]}
              >
                <View style={[theme.itemsCenter, theme.mT2]}>
                  <View
                    style={[
                      theme.w8,
                      theme.h2,
                      theme.bgGray400,
                      theme.roundedSm
                    ]}
                  />
                </View>
                <TabView
                  renderTabBar={props => (
                    <TabBar
                      {...props}
                      style={styles.tabBarContainerStyle}
                      indicatorStyle={styles.indicatorStyle}
                      renderLabel={({ route, focused }) => {
                        return (
                          <Text
                            style={[
                              { color: focused ? Colors.pm : Colors.gray800 },
                              styles.tabTextStyle
                            ]}
                          >
                            {route.title}
                          </Text>
                        );
                      }}
                    />
                  )}
                  navigationState={{ index, routes }}
                  renderScene={renderScene}
                  onIndexChange={setIndex}
                  initialLayout={{ width: layout.width, height: layout.height }}
                  sceneContainerStyle={{ flex: 1 }}
                  style={[theme.flexGrow, { marginBottom: -130 }]}
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
    paddingHorizontal: 0
  },
  indicatorStyle: {
    backgroundColor: Colors.pm,
    borderRadius: 5,
    height: 3
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.greenLight,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  tabBarContainerStyle: {
    backgroundColor: null
  },
  tabTextStyle: {
    fontWeight: '500'
  }
});

export default DashboardScreen;
