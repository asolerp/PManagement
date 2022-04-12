import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';

import {useTheme} from '../../Theme';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const ChecklistList = ({
  uid,
  house,
  houses,
  workers,
  time,
  state,
  typeFilters,
}) => {
  const {Layout, Gutters} = useTheme();
  const {t} = useTranslation();

  // let filteredValues;
  let firestoreQuery;

  if (house) {
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
  if (!uid && !house) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', state)
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
      <TouchableOpacity
        onPress={() => handlePressIncidence()}
        style={[Layout.fill, Gutters.tinyHMargin]}>
        <CheckItem item={item} fullWidth />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {loading && <DashboardSectionSkeleton />}
      <FlatList
        ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
        showsHorizontalScrollIndicator={false}
        data={filteredList?.sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[Gutters.regularTMargin]}
      />
    </>
  );
};

export default ChecklistList;
