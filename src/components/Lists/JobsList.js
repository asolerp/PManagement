import React from 'react';

import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {marginRight, width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import {Colors} from '../../Theme/Variables';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {JOBS} from '../../utils/firebaseKeys';
import JobItem from './JobItem';

import {useTheme} from '../../Theme';

import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 230,
    borderLeftWidth: 10,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: Colors.darkBlue,
    height: 50,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
    fontWeight: '500',
    color: Colors.darkBlue,
    height: 60,
  },
  bold: {
    fontWeight: '600',
    color: Colors.darkBlue,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: Colors.darkBlue,
  },
  buble: {
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  badget: {
    color: Colors.white,
    backgroundColor: Colors.pm,
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const JobsList = ({uid, houses, workers, time, typeFilters, state}) => {
  const {Fonts, Gutters} = useTheme();
  const {t} = useTranslation();
  const isOnlyTypeFilter = typeFilters.length === 1;

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
      <TouchableOpacity onPress={() => handlePressIncidence()}>
        <JobItem item={item} fullWidth={isOnlyTypeFilter} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[Gutters.smallBMargin]}>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        {/* <View style={[styles.badget, Gutters.tinyRMargin]}>
          {!loading && (
            <Text style={{color: Colors.white, fontWeight: 'bold'}}>
              {values?.filter((item) => item.id !== 'stats').length || 0}
            </Text>
          )}
        </View> */}
        <Text style={[Fonts.textTitle, {...marginRight(10)}]}>
          {t('common.jobs')}
        </Text>
      </View>
      {loading && <DashboardSectionSkeleton />}
      {(!loading && !filteredList) || filteredList?.length === 0 ? (
        <Text>{t('job.empty')}</Text>
      ) : (
        <FlatList
          horizontal={!isOnlyTypeFilter}
          showsHorizontalScrollIndicator={false}
          data={filteredList
            ?.filter((item) => item.id !== 'stats')
            .sort(sortByDate)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default JobsList;
