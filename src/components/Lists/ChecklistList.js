import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const styles = StyleSheet.create({
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: Colors.darkBlue,
    height: 40,
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
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  badget: {
    backgroundColor: Colors.success,
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ChecklistList = ({uid, house, houses, workers, time, typeFilters}) => {
  const {Gutters, Fonts} = useTheme();
  const {t} = useTranslation();

  const isOnlyTypeFilter = typeFilters.length === 1;

  // let filteredValues;
  let firestoreQuery = firestore().collection('checklists');

  console.log('WORKER', uid);

  if (house) {
    firestoreQuery = firestoreQuery
      .where('finished', '==', false)
      .where('houseId', '==', house?.id);
  }
  if (uid) {
    firestoreQuery = firestoreQuery
      .where('finished', '==', false)
      .where('workersId', 'array-contains', uid);
  }
  if (!uid && !house) {
    firestoreQuery = firestoreQuery
      .where('finished', '==', false)
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
      openScreenWithPush(CHECK_STACK_KEY, {
        screen: CHECK_SCREEN_KEY,
        docId: item.id,
      });
    };

    return (
      <TouchableOpacity onPress={() => handlePressIncidence()}>
        <CheckItem item={item} fullWidth={isOnlyTypeFilter} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[Gutters.smallBMargin]}>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={[Fonts.textTitle, Gutters.mediumRMargin]}>
          {t('checklists.title')}
        </Text>
      </View>
      {loading && <DashboardSectionSkeleton />}
      {(!loading && !values) || filteredList?.length === 0 ? (
        <Text>{t('checklists.empty')}</Text>
      ) : (
        <FlatList
          horizontal={!isOnlyTypeFilter}
          showsHorizontalScrollIndicator={false}
          data={filteredList?.sort(sortByDate)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default ChecklistList;
