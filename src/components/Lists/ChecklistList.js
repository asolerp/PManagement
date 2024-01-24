import React, {useEffect, useState} from 'react';
import {Text, Pressable, View, TouchableOpacity} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';

import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByFinished} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';
import {Colors} from '../../Theme/Variables';

const ChecklistList = ({uid, house, houses, workers, time, scrollEnabled}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);

  let firestoreQuery;
  let firestoreQueryNotFinished;

  if (house?.id) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', false)
      .where('houseId', '==', house?.id)
      .limit(limit);
  }

  if (uid) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', false)
      .where('workersId', 'array-contains', uid)
      .limit(limit);
  }

  if (time) {
    firestoreQueryNotFinished = firestore()
      .collection('checklists')
      .where('finished', '==', false)
      .where('date', '>', new Date(time.start))
      .where('date', '<', new Date(time.end));

    firestoreQuery = firestore()
      .collection('checklists')
      .where('finished', '==', true);
  }

  const [valuesNotFinished, loadingNotFinished] = useCollectionData(
    firestoreQueryNotFinished,
    {
      idField: 'id',
    },
  );

  const [values, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const filters = {
    houses,
    workers,
  };

  const {filteredList} = useFilters({list: data, filters});

  useEffect(() => {
    if (values || valuesNotFinished) {
      let result =
        houses && houses?.length > 0
          ? [...(valuesNotFinished || []), ...(values || [])]
          : [...(valuesNotFinished || [])];
      setData(result);
    }
  }, [values, valuesNotFinished, houses]);

  const handleShowMore = () => {
    setLimit((prevLimit) => prevLimit + 5);
  };

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
    <View style={[theme.flexGrow]}>
      {loading || (loadingNotFinished && <DashboardSectionSkeleton />)}
      <FlatList
        scrollEnabled={true}
        ListEmptyComponent={
          <Text style={[theme.textBlack]}>{t('checklists.empty')}</Text>
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity onPress={handleShowMore}>
            <Text
              style={[
                {color: Colors.pm},
                theme.fontSansBold,
                theme.textCenter,
              ]}>
              Show more
            </Text>
          </TouchableOpacity>
        }
        contentInset={{bottom: 150}}
        data={filteredList && sortByFinished(filteredList)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[theme.mT3]}
        contentContainerStyle={{paddingBottom: 50}}
      />
    </View>
  );
};

export default ChecklistList;
