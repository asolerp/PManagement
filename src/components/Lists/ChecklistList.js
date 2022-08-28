import React from 'react';
import {Text, FlatList, Pressable, View} from 'react-native';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils
import CheckItem from './CheckItem';

import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import {sortByDate} from '../../utils/sorts';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import {useFilters} from './hooks/useFilters';

const ChecklistList = ({uid, house, houses, workers, time}) => {
  const {Gutters} = useTheme();
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
        ListHeaderComponent={
          <View style={[theme.mT5, theme.mB2]}>
            <Text style={[theme.fontSansBold, theme.textXl, theme.textGray900]}>
              Activos
            </Text>
          </View>
        }
        ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
        showsVerticalScrollIndicator={false}
        contentInset={{bottom: 5}}
        data={filteredList?.filter((item) => !item.finished).sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={[theme.mT3]}
        ListFooterComponent={
          <>
            <View style={[theme.mT5]}>
              <Text
                style={[theme.fontSansBold, theme.textXl, theme.textGray900]}>
                Histórico
              </Text>
            </View>
            <FlatList
              ListEmptyComponent={<Text>{t('checklists.empty')}</Text>}
              showsHorizontalScrollIndicator={false}
              data={filteredList
                ?.filter((item) => item.finished)
                .sort((a, b) => sortByDate(a, b, 'desc'))}
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

export default ChecklistList;
