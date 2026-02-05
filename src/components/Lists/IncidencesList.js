import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

//Firebase
import {
  getFirestore,
  collection,
  query,
  where
} from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import { sortByDone, sortByIncidenceStatus } from '../../utils/sorts';
import { openScreenWithPush } from '../../Router/utils/actions';
import { INCIDENCE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import IncidenceItem from './IncidenceItem';

import { useTranslation } from 'react-i18next';
import { useFilters } from './hooks/useFilters';

const IncidencesList = ({ uid, houses, workers, state }) => {
  const { t } = useTranslation();

  const db = getFirestore();
  const incidencesRef = collection(db, 'incidences');

  let firestoreQuery;

  if (uid) {
    firestoreQuery = query(
      incidencesRef,
      where('workersId', 'array-contains', uid)
    );
  }
  if (!uid) {
    firestoreQuery = incidencesRef;
  }

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id'
  });

  const filters = {
    houses,
    workers,
    state
  };

  const { filteredList } = useFilters({
    list: values,
    filters,
    type: 'incidences'
  });

  const renderItem = ({ item }) => {
    const handlePressIncidence = () => {
      openScreenWithPush(INCIDENCE_SCREEN_KEY, {
        incidenceId: item.id
      });
    };

    return (
      <IncidenceItem item={item} fullWidth onPress={handlePressIncidence} />
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <DashboardSectionSkeleton />
      ) : (
        <FlatList
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('incidences.empty')}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentInset={{ bottom: 150 }}
          data={
            filteredList &&
            sortByDone(
              filteredList
                ?.filter(item => item.id !== 'stats')
                ?.sort(sortByIncidenceStatus('state'))
            )
          }
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center'
  },
  list: {
    marginTop: 12
  },
  listContent: {
    paddingBottom: 50,
    paddingTop: 12
  }
});

export default IncidencesList;
