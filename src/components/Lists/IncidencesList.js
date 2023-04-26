import React, {useEffect} from 'react';

import {Pressable, Text, View} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate, sortByDone, sortByIncidenceStatus} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import IncidenceItem from './IncidenceItem';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';

import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const IncidencesList = ({uid, houses, workers, state, scrollEnabled}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();

  let firestoreQuery;

  if (uid) {
    firestoreQuery = firestore()
      .collection('incidences')
      .where('workersId', 'array-contains', uid);
  }
  if (!uid) {
    firestoreQuery = firestore().collection('incidences');
  }

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const filters = {
    houses,
    workers,
    state,
  };

  const {filteredList} = useFilters({
    list: values,
    filters,
    type: 'incidences',
  });

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(INCIDENCE_SCREEN_KEY, {
        incidenceId: item.id,
      });
    };

    return (
      <Pressable
        style={[Gutters.tinyHMargin]}
        onPress={() => handlePressIncidence()}>
        <IncidenceItem item={item} fullWidth />
      </Pressable>
    );
  };

  return (
    <View style={[theme.flex1]}>
      {loading && <DashboardSectionSkeleton />}
      <FlatList
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled
        ListEmptyComponent={<Text style={[theme.textBlack]}>{t('incidences.empty')}</Text>}
        showsVerticalScrollIndicator={false}
        data={
          filteredList &&
          sortByDone(
            filteredList
              ?.filter((item) => item.id !== 'stats')
              ?.sort(sortByIncidenceStatus('state')),
          )
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
      />
    </View>
  );
};

export default IncidencesList;
