import React, {useEffect} from 'react';

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
import {useState} from 'react';
import moment from 'moment';

const IncidencesList = ({uid, houses, workers, state, scrollEnabled}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();
  const [oldIncidences, setOldIncidences] = useState();

  const start = moment(new Date()).subtract(7, 'days');
  const end = moment(new Date()).add(1, 'days');

  let firestoreQuery;

  useEffect(() => {
    const getOldIncidences = async () => {
      let query = firestore()
        .collection('incidences')
        .where('done', '==', true);

      if (uid) {
        query = query
          .where('workersId', 'array-contains', uid)
          .where('date', '>', new Date(start))
          .where('date', '<', new Date(end));
      }

      query = query
        .where('date', '>', new Date(start))
        .where('date', '<', new Date(end));

      const response = await query.get();
      setOldIncidences(
        response.docs.map((doc) => ({id: doc.id, ...doc.data()})),
      );
    };
    getOldIncidences();
  }, [uid, end, start]);

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
        ListHeaderComponent={
          <View style={[theme.mB2]}>
            <Text style={[theme.fontSansBold, theme.textXl, theme.textGray900]}>
              Activos
            </Text>
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
              <Text
                style={[theme.fontSansBold, theme.textXl, theme.textGray900]}>
                Histórico
              </Text>
            </View>
            <FlatList
              scrollEnabled={scrollEnabled}
              ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
              showsHorizontalScrollIndicator={false}
              data={oldIncidences?.sort((a, b) => sortByDate(a, b, 'desc'))}
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
