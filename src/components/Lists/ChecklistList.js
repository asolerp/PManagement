import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

// Utils
import CheckItem from './CheckItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTheme } from '../../Theme';
import theme from '../../Theme/Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import { sortByFinished } from '../../utils/sorts';
import { openScreenWithPush } from '../../Router/utils/actions';
import {
  CHECK_SCREEN_KEY,
  CHECK_STACK_KEY
} from '../../Router/utils/routerKeys';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../Theme/Variables';
import {
  fetchChecklistsFinishedPaginated,
  fetchChecklistsNotFinishedPaginated
} from '../../Services/firebase/checklistServices';

const ChecklistList = ({ uid, house, houses }) => {
  const { Gutters } = useTheme();
  const { t } = useTranslation();
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

  // Combinar y aplanar todos los checklists
  const allNotFinished =
    notFinishedData?.pages?.flatMap(page => page?.checklists || []) || [];
  const allFinished = shouldShowFinished
    ? finishedData?.pages?.flatMap(page => page?.checklists || []) || []
    : [];

  // Ordenar cada grupo por fecha (más recientes primero) y luego combinar
  const sortedNotFinished = allNotFinished.sort((a, b) => {
    // Función helper para convertir cualquier formato de fecha a Date
    const getDate = dateValue => {
      if (!dateValue) return new Date(0); // Fecha muy antigua para elementos sin fecha

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

    const dateA = getDate(a.date);
    const dateB = getDate(b.date);

    return dateB - dateA;
  });

  const sortedFinished = allFinished.sort((a, b) => {
    // Función helper para convertir cualquier formato de fecha a Date
    const getDate = dateValue => {
      if (!dateValue) return new Date(0); // Fecha muy antigua para elementos sin fecha

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
      openScreenWithPush(CHECK_STACK_KEY, {
        screen: CHECK_SCREEN_KEY,
        docId: item.id
      });
    };

    return (
      <Pressable
        onPress={() => handlePressIncidence()}
        style={Gutters.tinyHMargin}
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

    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={[{ color: Colors.pm }, theme.fontSansBold]}>
          Cargando más...
        </Text>
      </View>
    );
  };

  return (
    <View style={theme.flexGrow}>
      {isLoadingFinished || isLoadingNotFinished ? (
        <DashboardSectionSkeleton />
      ) : (
        <FlatList
          scrollEnabled={true}
          ListEmptyComponent={
            <Text style={theme.textBlack}>{t('checklists.empty')}</Text>
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          contentInset={{ bottom: 150 }}
          data={sortByFinished(allChecklists)}
          renderItem={renderItem}
          keyExtractor={item => item?.id || Math.random().toString()}
          style={theme.mT3}
          contentContainerStyle={{ paddingBottom: 50 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          extraData={houses}
        />
      )}
    </View>
  );
};

export default ChecklistList;
