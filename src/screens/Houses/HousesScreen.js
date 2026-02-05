import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';

import AddButton from '../../components/Elements/AddButton';
import HouseItemList from '../../components/HouseItemList';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';

import { openScreenWithPush } from '../../Router/utils/actions';
import {
  HOUSE_SCREEN_KEY,
  NEW_HOUSE_SCREEN_KEY
} from '../../Router/utils/routerKeys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { HOUSES } from '../../utils/firebaseKeys';
import { fetchHousesPaginated } from '../../Services/firebase/houseServices';

const HousesScreen = () => {
  const { t } = useTranslation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [HOUSES],
      queryFn: fetchHousesPaginated,
      getNextPageParam: lastPage => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      initialPageParam: null
    });

  // Aplanar todas las páginas en un solo array
  const houses = data?.pages?.flatMap(page => page?.houses || []) || [];

  const handleNewHome = () => {
    openScreenWithPush(NEW_HOUSE_SCREEN_KEY);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Cargando más casas...</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          openScreenWithPush(HOUSE_SCREEN_KEY, {
            houseId: item.id
          })
        }
      >
        <HouseItemList house={item} />
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No hay creada ninguna casa. Crear tu primera casa para poder empezar a
        asignar trabajos a tus trabajadores
      </Text>
    </View>
  );

  return (
    <PageLayout safe titleLefSide={true} edges={['top']}>
      <AddButton
        iconName="add"
        onPress={handleNewHome}
        containerStyle={styles.addButtonPosition}
      />
      <View style={styles.container}>
        <ScreenHeader title={t('houses.title')} />
        <View style={styles.listContainer}>
          <FlatList
            data={houses}
            ListEmptyComponent={renderEmptyComponent}
            renderItem={renderItem}
            keyExtractor={item => item?.id || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  addButtonPosition: {
    bottom: 30,
    right: 0
  },
  container: {
    flex: 1,
    marginBottom: 15
  },
  emptyContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    width: '100%'
  },
  emptyText: {
    color: '#2d3748',
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center'
  },
  itemContainer: {
    width: '100%'
  },
  listContainer: {
    paddingTop: 20
  },
  listContent: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 40
  },
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 20
  },
  loadingText: {
    color: '#4a5568',
    fontSize: 14
  }
});

export default HousesScreen;
