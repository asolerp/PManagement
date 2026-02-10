import React, { useState, useContext } from 'react';
import { View, StyleSheet, Text, Pressable, LayoutAnimation } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ProfileBar from '../../components/ProfileBar';
import PageLayout from '../../components/PageLayout';
import AddButton from '../../components/Elements/AddButton';
import { HousesFilter } from '../../components/Dashboard/HousesFilter';
import { HDivider } from '../../components/UI/HDivider';
import { IncidencesTab } from '../../components/Dashboard/Tabs/IncidencesTab';
import { openScreenWithPush } from '../../Router/utils/actions';
import { NEW_INCIDENCE_SCREEN_KEY } from '../../Router/utils/routerKeys';

import { FiltersContext } from '../../context/FiltersContext';
import { useAnimatedContainer } from '../Dashboard/hooks/useAnimatedContainer';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';

import Animated from 'react-native-reanimated';

const IncidencesScreen = () => {
  const [showFilters, setShowFilters] = useState(true);
  const { filters, setFilters } = useContext(FiltersContext);
  const { isScrollActive, containerStyles } = useAnimatedContainer();

  return (
    <PageLayout
      statusBar="light-content"
      withTitle={false}
      withPadding={false}
      edges={['top']}
    >
      <AddButton
        iconName="add"
        onPress={() => openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY)}
      />
      <View style={styles.mainContainer}>
        <View style={styles.profileBarContainerStyle}>
          <ProfileBar />
        </View>
        <View style={styles.contentContainer}>
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

          {showFilters && (
            <HousesFilter
              houses={filters.houses}
              onClickHouse={houses => {
                setFilters(old => ({ ...old, houses }));
              }}
            />
          )}

          <HDivider style={styles.divider} />

          <Animated.View style={[styles.tabContent, containerStyles]}>
            <View style={styles.sceneContainer}>
              <IncidencesTab
                filters={filters}
                scrollEnabled={isScrollActive}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </PageLayout>
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
  sceneContainer: {
    flex: 1
  },
  tabContent: {
    backgroundColor: Colors.gray100,
    flex: 1,
    paddingHorizontal: Spacing.base
  }
});

export default IncidencesScreen;
