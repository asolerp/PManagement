import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  LayoutAnimation
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

// Utils
import moment from 'moment';

import { FiltersContext } from '../../context/FiltersContext';
import { ActionButtons } from '../../components/Dashboard/ActionButtons';
import { ChecklistsTab } from '../../components/Dashboard/Tabs/ChecklistsTab';
import { IncidencesTab } from '../../components/Dashboard/Tabs/IncidencesTab';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';
import { HousesFilter } from '../../components/Dashboard/HousesFilter';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import theme from '../../Theme/Theme';
import Animated from 'react-native-reanimated';
import { useAnimatedContainer } from '../Dashboard/hooks/useAnimatedContainer';
import { HDivider } from '../../components/UI/HDivider';
import AddButton from '../../components/Elements/AddButton';
import { openScreenWithPush } from '../../Router/utils/actions';
import { CONFIRM_ENTRANCE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { useDashboardWorker } from './hooks/useDashboardWorker';
import { useGetGlobalStats } from '../../components/Dashboard/hooks/useGetGlobalStats';
import EntranceCard from '../../components/Dashboard/EntranceCard';

export const ENTRANCE_FORMAT = 'HH:mm';

const DashboardWorkerScreen = () => {
  const [index, setIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilters } = useContext(FiltersContext);
  const routes = [
    { key: 'checklists', title: 'Checklists' },
    { key: 'incidences', title: 'Incidencias' }
  ];
  const user = useSelector(userSelector);
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);
  const { isScrollActive, containerStyles } = useAnimatedContainer();
  const { entrance, onRegisterExit, refresh } = useDashboardWorker();
  const { checks, incidences } = useGetGlobalStats({ uid: user?.id });

  // Refrescar datos cuando la pantalla vuelve al foco
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderScene = ({ route }) => {
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

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
        edges={['top']}
      >
        <ActionButtons />
        {!entrance && (
          <AddButton
            containerStyle={styles.entranceButton}
            iconName="login"
            onPress={() => openScreenWithPush(CONFIRM_ENTRANCE_SCREEN_KEY)}
          />
        )}
        <View style={[theme.flex1, theme.bgGray100]}>
          <View style={styles.profileBarContainerStyle}>
            <ProfileBar />
          </View>
          <View style={[[theme.flex1], styles.container]}>
            {/* Toggle de filtros */}
            <Pressable
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setShowFilters(!showFilters);
              }}
              style={({ pressed }) => [
                styles.filterToggle,
                pressed && styles.filterTogglePressed
              ]}
            >
              <Icon name="filter-list" size={20} color={Colors.primary} />
              <Text style={styles.filterToggleText}>
                {showFilters ? 'Ocultar filtros' : 'Filtrar por casa'}
              </Text>
              <Icon
                name={showFilters ? 'expand-less' : 'expand-more'}
                size={20}
                color={Colors.gray500}
              />
            </Pressable>

            {/* Filtros colapsables */}
            {showFilters && (
              <HousesFilter
                houses={filters.houses}
                onClickHouse={houses => {
                  setFilters(oldFilters => ({
                    ...oldFilters,
                    houses
                  }));
                }}
              />
            )}
            <HDivider style={styles.divider} />
            <EntranceCard entrance={entrance} onRegisterExit={onRegisterExit} />

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
  container: {
    paddingHorizontal: 0
  },
  divider: {
    marginVertical: Spacing.md
  },
  entranceButton: {
    left: 30,
    right: undefined
  },
  filterToggle: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  filterTogglePressed: {
    opacity: 0.7
  },
  filterToggleText: {
    color: Colors.gray700,
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl']
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
    backgroundColor: Colors.primary
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
    backgroundColor: Colors.primary,
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
    color: Colors.primary,
    fontWeight: FontWeight.semibold
  },
  tabsHeader: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    paddingHorizontal: Spacing.base
  }
});

export default DashboardWorkerScreen;
