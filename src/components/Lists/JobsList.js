import React from 'react';

import {Pressable, Text, FlatList, View} from 'react-native';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {JOBS} from '../../utils/firebaseKeys';
import JobItem from './JobItem';

import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const JobsList = ({uid, houses, workers, time, state}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();

  let firestoreQuery;
  if (uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('workersId', 'array-contains', uid)
      .where('date', '>', new Date(time.start))
      .where('date', '<', new Date(time.end));
  }
  if (!uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('date', '>', new Date(time.start))
      .where('date', '<', new Date(time.end));
  }

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const filters = {
    houses,
    workers,
  };

  const {filteredList} = useFilters({list: values, filters});
  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(JOB_SCREEN_KEY, {
        jobId: item.id,
      });
    };

    return (
      <Pressable
        style={[Gutters.tinyHMargin]}
        onPress={() => handlePressIncidence()}>
        <JobItem item={item} fullWidth />
      </Pressable>
    );
  };

  return (
    <>
      {loading && <DashboardSectionSkeleton />}
      <FlatList
        ListHeaderComponent={
          <View style={[theme.mT5, theme.mB2]}>
            <Text style={[theme.fontSansBold, theme.text2xl]}>Activos</Text>
          </View>
        }
        ListEmptyComponent={<Text>{t('job.empty')}</Text>}
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
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        data={filteredList
          ?.filter((item) => item.id !== 'stats')
          .filter((item) => !item.done)
          .sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
      />
    </>
  );
};

export default JobsList;
