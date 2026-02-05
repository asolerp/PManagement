import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

import { ActionButtons } from '../../components/Dashboard/ActionButtons';
import AddButton from '../../components/Elements/AddButton';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';
import { HousesFilter } from '../../components/Dashboard/HousesFilter';
import { HDivider } from '../../components/UI/HDivider';

import Animated from 'react-native-reanimated';
import { RECYCLE_BIN_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { openScreenWithPush } from '../../Router/utils/actions';
import { useDashboard } from './hooks/useDashboard';
import { useGetGlobalStats } from '../../components/Dashboard/hooks/useGetGlobalStats';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';

const DashboardScreen = () => {
  const user = useSelector(userSelector);
  const statsUid = user?.role === 'admin' ? null : user?.id;
  const { checks, incidences } = useGetGlobalStats({ uid: statsUid });

  const {
    index,
    routes,
    filters,
    setIndex,
    setFilters,
    renderScene,
    containerStyles
  } = useDashboard();

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
        edges={['top']}
      >
        <AddButton
          containerStyle={styles.recycleBinButton}
          iconName="restore-from-trash"
          onPress={() => openScreenWithPush(RECYCLE_BIN_SCREEN_KEY)}
        />

        <ActionButtons />
        <View style={styles.mainContainer}>
          <View style={styles.profileBarContainerStyle}>
            <ProfileBar />
          </View>
          <View style={styles.contentContainer}>
            <HousesFilter
              houses={filters.houses}
              onClickHouse={houses => {
                setFilters(oldFilters => ({
                  ...oldFilters,
                  houses
                }));
              }}
            />
            <HDivider style={styles.divider} />

            {/* Custom Simple Tabs */}
            <View style={styles.tabsHeader}>
              <Pressable
                onPress={() => setIndex(0)}
                style={({ pressed }) => [
                  styles.tabButton,
                  index === 0 && styles.tabButtonActive,
                  pressed && styles.tabButtonPressed
                ]}
              >
                <Text
                  style={[styles.tabText, index === 0 && styles.tabTextActive]}
                >
                  Checklists
                </Text>
                <View
                  style={[
                    styles.tabBadge,
                    index === 0 && styles.tabBadgeActive
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      index === 0 && styles.tabBadgeTextActive
                    ]}
                  >
                    {checks || 0}
                  </Text>
                </View>
                {index === 0 && <View style={styles.tabIndicator} />}
              </Pressable>

              <Pressable
                onPress={() => setIndex(1)}
                style={({ pressed }) => [
                  styles.tabButton,
                  index === 1 && styles.tabButtonActive,
                  pressed && styles.tabButtonPressed
                ]}
              >
                <Text
                  style={[styles.tabText, index === 1 && styles.tabTextActive]}
                >
                  Incidencias
                </Text>
                <View
                  style={[
                    styles.tabBadge,
                    index === 1 && styles.tabBadgeActive
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      index === 1 && styles.tabBadgeTextActive
                    ]}
                  >
                    {incidences || 0}
                  </Text>
                </View>
                {index === 1 && <View style={styles.tabIndicator} />}
              </Pressable>
            </View>

            {/* Tab Content */}

            <Animated.View style={[styles.tabContent, containerStyles]}>
              <View style={styles.sceneContainer}>
                {renderScene({ route: routes[index] })}
              </View>
            </Animated.View>
          </View>
        </View>
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0
  },
  divider: {
    marginVertical: Spacing.md
  },
  handleIndicator: {
    backgroundColor: Colors.gray300,
    borderRadius: BorderRadius.sm,
    height: 8,
    width: 32
  },
  handleIndicatorContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm
  },
  mainContainer: {
    backgroundColor: Colors.gray100,
    flex: 1
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.greenLight,
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl']
  },
  recycleBinButton: {
    left: 30,
    right: undefined
  },
  sceneContainer: {
    flex: 1
  },
  tabBadge: {
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
    minWidth: 24,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2
  },
  tabBadgeActive: {
    backgroundColor: Colors.pm
  },
  tabBadgeText: {
    color: Colors.gray500,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textAlign: 'center'
  },
  tabBadgeTextActive: {
    color: Colors.white
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
    position: 'relative'
  },
  tabButtonActive: {
    // Active tab styles handled by text and badge
  },
  tabButtonPressed: {
    opacity: 0.7
  },
  tabContent: {
    backgroundColor: Colors.gray100,
    flex: 1,
    paddingHorizontal: Spacing.base
  },
  tabIndicator: {
    backgroundColor: Colors.pm,
    borderRadius: BorderRadius.sm,
    bottom: 0,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0
  },
  tabText: {
    color: Colors.gray800,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium
  },
  tabTextActive: {
    color: Colors.pm,
    fontWeight: FontWeight.semibold
  },
  tabsHeader: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    paddingHorizontal: Spacing.base
  }
});

export default DashboardScreen;
