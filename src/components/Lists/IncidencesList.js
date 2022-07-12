import React from 'react';

import {Pressable, Text, FlatList, View} from 'react-native';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate, sortByIncidenceStatus} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import IncidenceItem from './IncidenceItem';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';

import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const IncidencesList = ({uid, houses, workers, state, time, typeFilters}) => {
  const {Layout, Gutters} = useTheme();
  const {t} = useTranslation();

  let firestoreQuery;
  if (uid) {
    firestoreQuery = firestore()
      .collection('incidences')
      .where('workersId', 'array-contains', uid)
      .where('date', '>', new Date(time?.start))
      .where('date', '<', new Date(time?.end));
  }
  if (!uid) {
    firestoreQuery = firestore()
      .collection('incidences')
      .where('date', '>', new Date(time?.start))
      .where('date', '<', new Date(time?.end));
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
        nestedScrollEnabled
        ListHeaderComponent={
          <View style={[theme.mB2]}>
            <Text style={[theme.fontSansBold, theme.text2xl]}>Activos</Text>
          </View>
        }
        ListEmptyComponent={<Text>{t('incidences.empty')}</Text>}
        showsVerticalScrollIndicator={false}
        data={filteredList
          ?.filter((item) => item.id !== 'stats')
          .filter((item) => !item.done)
          .sort(sortByIncidenceStatus('state'))
          .sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
        ListFooterComponent={
          <>
            <View style={[theme.mT5]}>
              <Text style={[theme.fontSansBold, theme.text2xl]}>Histórico</Text>
            </View>
            <FlatList
              ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
              showsHorizontalScrollIndicator={false}
              data={filteredList?.filter((item) => item.done).sort(sortByDate)}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={[theme.mT3]}
            />
          </>
        }
      />
    </View>
  );
};

export default IncidencesList;
