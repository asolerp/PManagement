import React from 'react';

import {Pressable, Text, FlatList} from 'react-native';

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

import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const JobsList = ({uid, houses, workers, time, state}) => {
  const {Gutters, Layout} = useTheme();
  const {t} = useTranslation();

  let firestoreQuery;
  if (uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('workersId', 'array-contains', uid)
      .where('done', '==', false)
      .where('date', '>', new Date(time.start))
      .where('date', '<', new Date(time.end));
  }
  if (!uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('done', '==', state)
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
      <Pressable style={[Layout.fill]} onPress={() => handlePressIncidence()}>
        <JobItem item={item} fullWidth />
      </Pressable>
    );
  };

  return (
    <>
      {loading && <DashboardSectionSkeleton />}
      <FlatList
        ListEmptyComponent={<Text>{t('job.empty')}</Text>}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        data={filteredList
          ?.filter((item) => item.id !== 'stats')
          .sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
      />
    </>
  );
};

export default JobsList;
