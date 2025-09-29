import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';

// Firebase

import AddButton from '../../components/Elements/AddButton';
import HouseItemList from '../../components/HouseItemList';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';

import { openScreenWithPush } from '../../Router/utils/actions';
import {
  HOUSE_SCREEN_KEY,
  NEW_HOUSE_SCREEN_KEY
} from '../../Router/utils/routerKeys';
import { useTheme } from '../../Theme';
import theme from '../../Theme/Theme';
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

  const { Layout } = useTheme();

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
        <Text>Cargando más casas...</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={theme.wFull}
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

  return (
    <React.Fragment>
      <PageLayout safe titleLefSide={true} edges={['top']}>
        <AddButton
          iconName="add"
          onPress={() => handleNewHome()}
          containerStyle={{ right: 0, bottom: 30 }}
        />
        <View style={styles.container}>
          <ScreenHeader title={t('houses.title')} />
          <View style={styles.homesScreen}>
            <FlatList
              data={houses}
              ListEmptyComponent={() => (
                <View style={[theme.wFull, theme.mT10]}>
                  <Text style={theme.fontSans}>
                    No hay creada ninguna casa. Crear tu primera casa para poder
                    empezar a asignar trabajos a tus trabajadores
                  </Text>
                </View>
              )}
              renderItem={renderItem}
              keyExtractor={item => item?.id || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              contentContainerStyle={[
                Layout.flexGrow,
                Layout.alignItemsCenter,
                theme.pB10
              ]}
            />
          </View>
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  addButton: {
    bottom: 40,
    position: 'absolute',
    right: 30,
    zIndex: 10
  },
  container: {
    flex: 1,
    marginBottom: 15
  },
  homesScreen: {
    paddingTop: 20
  },
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 20
  },
  scrollWrapper: {
    alignItems: 'center',
    flex: 1
  }
});

export default HousesScreen;
