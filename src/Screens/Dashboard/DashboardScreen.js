import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  LayoutAnimation
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

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
import {
  NEW_CHECKLIST_SCREEN,
  RECYCLE_BIN_SCREEN_KEY
} from '../../Router/utils/routerKeys';
import { openScreenWithPush } from '../../Router/utils/actions';
import { useDashboard } from './hooks/useDashboard';

const DashboardScreen = () => {
  const [showFilters, setShowFilters] = useState(true);

  const { filters, setFilters, renderChecklistsContent, containerStyles } =
    useDashboard();

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
        <AddButton
          iconName="add"
          onPress={() => openScreenWithPush(NEW_CHECKLIST_SCREEN)}
        />
        <View style={styles.mainContainer}>
          <View style={styles.profileBarContainerStyle}>
            <ProfileBar />
          </View>
          <View style={styles.contentContainer}>
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

            <Animated.View style={[styles.tabContent, containerStyles]}>
              <View style={styles.sceneContainer}>
                {renderChecklistsContent}
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
  mainContainer: {
    backgroundColor: Colors.gray100,
    flex: 1
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.secondary,
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
  tabContent: {
    backgroundColor: Colors.gray100,
    flex: 1,
    paddingHorizontal: Spacing.base
  }
});

export default DashboardScreen;
