import React, {useEffect, useState} from 'react';
import {Text, FlatList, Pressable, View} from 'react-native';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';

import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate, sortByFinished} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const ChecklistList = ({uid, house, houses, workers, time, scrollEnabled}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();

  // let filteredValues;
  let firestoreQuery;

  if (house?.id) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', false)
      .where('houseId', '==', house?.id);
  }

  if (uid) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', false)
      .where('workersId', 'array-contains', uid);
  }

  if (!uid && !house?.id && time) {
    firestoreQuery = firestore()
      .collection('checklists')
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
      <Pressable
        onPress={() => handlePressIncidence()}
        style={[Gutters.tinyHMargin]}>
        <CheckItem item={item} fullWidth />
      </Pressable>
    );
  };

  return (
    <View style={[theme.flex1]}>
      {loading && <DashboardSectionSkeleton />}
      <FlatList
        scrollEnabled={scrollEnabled}
        ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
        showsVerticalScrollIndicator={false}
        contentInset={{bottom: 5}}
        data={filteredList && sortByFinished(filteredList)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[theme.mT3]}
      />
    </View>
  );
};

export default ChecklistList;
