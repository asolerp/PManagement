import React from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable
} from 'react-native';

import { Colors } from '../../Theme/Variables';
import FastImage from 'react-native-fast-image';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HousesSkeleton } from './HousesSkeleton';
import { DEFAULT_IMAGE } from '../../constants/general';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchHousesPaginated } from '../../Services/firebase/houseServices';
import { HOUSES } from '../../utils/firebaseKeys';

export const HousesFilter = ({ houses, onClickHouse }) => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [HOUSES],
      queryFn: fetchHousesPaginated,
      getNextPageParam: lastPage => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      initialPageParam: null
    });

  // Aplanar todas las páginas de casas en un solo array
  const allHouses = data?.pages?.flatMap(page => page?.houses || []) || [];

  const isInArray = id => {
    return houses?.find(idHouse => idHouse === id);
  };

  const handleSetHouse = house => {
    if (isInArray(house.id)) {
      const housesWithoutID = houses?.filter(id => {
        return id !== house.id;
      });
      onClickHouse(housesWithoutID);
    } else {
      onClickHouse([...(houses || []), house.id]);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = isInArray(item.id);

    return (
      <Pressable
        onPress={() => handleSetHouse(item)}
        style={({ pressed }) => [
          styles.houseCard,
          isSelected && styles.houseCardSelected,
          pressed && styles.houseCardPressed
        ]}
      >
        {/* Background Image */}
        <FastImage
          style={styles.houseCardImage}
          source={{
            uri: item?.houseImage?.small || DEFAULT_IMAGE,
            priority: FastImage.priority.normal
          }}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Selected Check Badge */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Icon name="check-circle" size={24} color="#10B981" />
          </View>
        )}

        {/* House Name */}
        <View style={styles.houseNameContainer}>
          <Text numberOfLines={2} style={styles.houseNameText}>
            {item?.houseName}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderAllButton = () => {
    const isAllSelected = !houses || houses.length === 0;

    return (
      <Pressable
        onPress={() => onClickHouse([])}
        style={({ pressed }) => [
          styles.allButton,
          isAllSelected && styles.allButtonSelected,
          pressed && styles.houseCardPressed
        ]}
      >
        <View style={styles.allButtonContent}>
          <Icon
            name="home"
            size={24}
            color={isAllSelected ? '#FFFFFF' : '#6B7280'}
          />
          <Text
            style={[
              styles.allButtonText,
              isAllSelected && styles.allButtonTextSelected
            ]}
          >
            Todas
          </Text>
        </View>

        {isAllSelected && (
          <View style={styles.selectedBadge}>
            <Icon name="check-circle" size={24} color="#10B981" />
          </View>
        )}

        {isAllSelected && (
          <LinearGradient
            colors={['#55A5AD', '#3B8A91']}
            style={styles.allButtonGradient}
          />
        )}
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <HousesSkeleton />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allHouses}
          renderItem={renderItem}
          keyExtractor={item => item?.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderAllButton}
          ListFooterComponent={renderFooter}
          extraData={houses}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  allButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    elevation: 2,
    height: 80,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 75
  },
  allButtonContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    zIndex: 2
  },
  allButtonGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1
  },
  allButtonSelected: {
    borderColor: '#10B981',
    borderWidth: 2
  },
  allButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  allButtonTextSelected: {
    color: '#FFFFFF'
  },
  container: {
    marginTop: 6
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1
  },
  houseCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    elevation: 2,
    height: 80,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 120
  },
  houseCardImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  },
  houseCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }]
  },
  houseCardSelected: {
    borderColor: '#10B981',
    borderWidth: 2
  },
  houseNameContainer: {
    bottom: 0,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    zIndex: 2
  },
  houseNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  loadingDot: {
    backgroundColor: '#cbd5e0',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 2,
    width: 8
  },
  loadingFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  selectedBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 4,
    padding: 2,
    position: 'absolute',
    right: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    top: 8,
    zIndex: 3
  }
});
