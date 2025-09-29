import React from 'react';

import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text
} from 'react-native';

import { useTheme } from '../../Theme';
import theme from '../../Theme/Theme';

import { Colors } from '../../Theme/Variables';
import FastImage from 'react-native-fast-image';
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

  const { Gutters } = useTheme();

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

  // Debug: log para verificar el estado
  console.log('HousesFilter Debug:', {
    isLoading,
    allHousesLength: allHouses.length,
    hasNextPage,
    isFetchingNextPage,
    pagesCount: data?.pages?.length || 0
  });

  const renderItem = ({ item }) => {
    return (
      <View style={theme.itemsCenter}>
        <TouchableOpacity
          key={item.id}
          onPress={() => handleSetHouse(item)}
          style={[
            isInArray(item.id) && styles.activeFilter,
            Gutters.tinyHMargin
          ]}
        >
          <FastImage
            style={[
              theme.bgWhite,
              theme.shadow2xl,
              { width: 50, height: 50, borderRadius: 100 }
            ]}
            source={{
              uri: item?.houseImage?.small || DEFAULT_IMAGE,
              priority: FastImage.priority.normal
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[theme.maxW12, theme.textXs, theme.textGray700, theme.mT2]}
        >
          {item?.houseName}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <View style={[styles.loadingDot, theme.bgGray400]} />
        <View style={[styles.loadingDot, theme.bgGray400]} />
        <View style={[styles.loadingDot, theme.bgGray400]} />
      </View>
    );
  };

  return (
    <View style={theme.mT2}>
      {isLoading ? (
        <HousesSkeleton />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allHouses}
          renderItem={renderItem}
          keyExtractor={item => item?.id || Math.random().toString()}
          contentContainerStyle={[theme.pX4]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          extraData={houses}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeFilter: {
    backgroundColor: 'transparent',
    borderColor: Colors.success,
    borderRadius: 100,
    borderWidth: 3
  },

  loadingDot: {
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
  }
});
