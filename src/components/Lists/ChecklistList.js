import React from 'react';
import {
  Text,
  Pressable,
  View,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utils
import CheckItem from './CheckItem';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import { sortByFinished } from '../../utils/sorts';
import { openScreenWithPush } from '../../Router/utils/actions';
import { CHECK_SCREEN_KEY } from '../../Router/utils/routerKeys';
import {
  fetchChecklistsFinishedPaginated,
  fetchChecklistsNotFinishedPaginated
} from '../../Services/firebase/checklistServices';
import { BorderRadius } from '../../Theme/Variables';

// Componente para el estado vacío
const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Icon name="checklist" size={64} color="#CBD5E0" />
      </View>
      <Text style={styles.emptyTitle}>No hay checklists</Text>
      <Text style={styles.emptyDescription}>{t('checklists.empty')}</Text>
    </View>
  );
};

// Componente para el footer de carga
const LoadingFooter = () => (
  <View style={styles.loadingFooter}>
    <ActivityIndicator size="small" color="#55A5AD" />
    <Text style={styles.loadingText}>Cargando más...</Text>
  </View>
);

const ChecklistList = ({ uid, house, houses }) => {
  const limit = 10;

  // Query para checklists no finalizados
  const {
    data: notFinishedData,
    isLoading: isLoadingNotFinished,
    isFetchingNextPage: isFetchingNextPageNotFinished,
    hasNextPage: hasNextPageNotFinished,
    fetchNextPage: fetchNextPageNotFinished
  } = useInfiniteQuery({
    queryKey: ['checklistsNotFinishedPaginated', uid, house, limit, houses],
    queryFn: fetchChecklistsNotFinishedPaginated,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: null
  });

  // Determinar si mostrar checklists finalizados (solo cuando hay una casa específica seleccionada)
  const shouldShowFinished = house?.id || houses?.length === 1;

  // Query para checklists finalizados (solo si debe mostrarlos)
  const {
    data: finishedData,
    isLoading: isLoadingFinished,
    isFetchingNextPage: isFetchingNextPageFinished,
    hasNextPage: hasNextPageFinished,
    fetchNextPage: fetchNextPageFinished
  } = useInfiniteQuery({
    queryKey: ['checklistsFinishedPaginated', uid, limit, houses],
    queryFn: fetchChecklistsFinishedPaginated,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: null,
    enabled: shouldShowFinished // Solo ejecutar la query si debe mostrar finalizados
  });

  // Helper para convertir cualquier formato de fecha a Date
  const getDate = dateValue => {
    if (!dateValue) return new Date(0);

    // Si es un Firestore Timestamp
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }

    // Si es un objeto Moment
    if (dateValue._isAMomentObject && dateValue.toDate) {
      return dateValue.toDate();
    }

    // Si es string o cualquier otro formato
    return new Date(dateValue);
  };

  // Combinar y aplanar todos los checklists
  const allNotFinished =
    notFinishedData?.pages?.flatMap(page => page?.checklists || []) || [];
  const allFinished = shouldShowFinished
    ? finishedData?.pages?.flatMap(page => page?.checklists || []) || []
    : [];

  // Ordenar cada grupo por fecha (más recientes primero)
  const sortedNotFinished = allNotFinished.sort((a, b) => {
    const dateA = getDate(a.date);
    const dateB = getDate(b.date);
    return dateB - dateA;
  });

  const sortedFinished = allFinished.sort((a, b) => {
    const dateA = getDate(a.date);
    const dateB = getDate(b.date);
    return dateB - dateA;
  });

  // Combinar: primero not-finished, luego finished
  const allChecklists = [...sortedNotFinished, ...sortedFinished];

  const handleLoadMore = () => {
    // Cargar más not finished si hay disponibles
    if (hasNextPageNotFinished && !isFetchingNextPageNotFinished) {
      fetchNextPageNotFinished();
    }
    // Cargar más finished si hay disponibles (solo si debe mostrar finalizados)
    if (
      shouldShowFinished &&
      hasNextPageFinished &&
      !isFetchingNextPageFinished
    ) {
      fetchNextPageFinished();
    }
  };

  const renderItem = ({ item }) => {
    const handlePressIncidence = () => {
      openScreenWithPush(CHECK_SCREEN_KEY, {
        docId: item.id
      });
    };

    return (
      <Pressable
        onPress={() => handlePressIncidence()}
        style={styles.itemContainer}
        activeOpacity={0.7}
      >
        <CheckItem item={item} fullWidth />
      </Pressable>
    );
  };

  const renderFooter = () => {
    const isLoadingMore =
      isFetchingNextPageNotFinished ||
      (shouldShowFinished && isFetchingNextPageFinished);

    if (!isLoadingMore) return null;

    return <LoadingFooter />;
  };

  return (
    <View style={styles.container}>
      {isLoadingFinished || isLoadingNotFinished ? (
        <DashboardSectionSkeleton />
      ) : (
        <FlatList
          scrollEnabled={true}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          contentInset={{ bottom: 150 }}
          data={sortByFinished(allChecklists)}
          renderItem={renderItem}
          keyExtractor={item => item?.id || Math.random().toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          extraData={houses}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80
  },
  emptyDescription: {
    color: '#718096',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  emptyIconWrapper: {
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120
  },
  emptyTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  itemContainer: {
    borderRadius: BorderRadius.lg,
    marginHorizontal: 4,
    overflow: 'hidden'
  },
  list: {
    marginTop: 12
  },
  listContent: {
    paddingBottom: 50
  },
  // Loading Footer
  loadingFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 20
  },
  loadingText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500'
  }
});

export default ChecklistList;
