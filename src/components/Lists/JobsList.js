import React, {useEffect, useState} from 'react';

import {Pressable, Text, View} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDone} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {JOBS} from '../../utils/firebaseKeys';
import JobItem from './JobItem';

import {useTheme} from '../../Theme';

import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';
import theme from '../../Theme/Theme';

const JobsList = ({uid, houses, workers, scrollEnabled}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();

  let firestoreQuery;
  if (uid) {
    firestoreQuery = firestore()
      .collection(JOBS)
      .where('workersId', 'array-contains', uid);
  }
  if (!uid) {
    firestoreQuery = firestore().collection(JOBS);
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
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={[theme.textBlack]}>{t('job.empty')}</Text>}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        data={
          filteredList &&
          sortByDone(filteredList?.filter((item) => item.id !== 'stats'))
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
      />
    </>
  );
};

export default JobsList;
