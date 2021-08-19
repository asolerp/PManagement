import React, {useState} from 'react';

import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import CheckItem from '../../components/CheckItem';

import {useTheme} from '../../Theme';
import ItemListSkeleton from '../../components/Skeleton/ItemListSkeleton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {CHECKLISTS} from '../../utils/firebaseKeys';

import {parseTimeFilter} from '../../utils/parsers';
import CustomModal from '../../components/Modal';
import Filters from '../../components/Filters/Filters';
import {sortByDate} from '../../utils/sorts';
import {useTranslation} from 'react-i18next';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  filterWrapper: {
    marginVertical: 20,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkListWrapper: {
    marginTop: 0,
  },
});

const Container = () => {
  const {t} = useTranslation();
  const {Layout, Fonts, Gutters} = useTheme();
  const [visibleModal, setVisibleModal] = useState();
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
  });

  const [values, loading] = useCollectionData(
    firestore()
      .collection(CHECKLISTS)
      .where('finished', '==', filters.state)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end)),
    {
      idField: 'id',
    },
  );

  const checklist = values
    ?.filter((check) =>
      filters?.workers?.length > 0
        ? filters.workers.some((fworker) => check?.workersId?.includes(fworker))
        : true,
    )
    .filter((check) =>
      filters?.houses?.length > 0
        ? filters.houses.includes(check.houseId)
        : true,
    )
    .sort((a, b) => sortByDate(a, b, 'desc'));

  const renderItem = ({item}) => (
    <CheckItem
      key={item.id}
      check={item}
      onPress={() =>
        openScreenWithPush(CHECK_STACK_KEY, {
          screen: CHECK_SCREEN_KEY,
          docId: item.id,
        })
      }
    />
  );

  return (
    <View style={[Layout.fill]}>
      <View style={[Layout.fill, styles.filterWrapper]}>
        <CustomModal
          visible={visibleModal}
          setVisible={setVisibleModal}
          size={0.8}>
          <Filters
            activeFilters={{
              houses: true,
              workers: true,
              time: true,
              state: true,
            }}
            initialFilters={filters}
            onSaveFilters={(f) => {
              setFilters(f);
              setVisibleModal(false);
            }}
          />
        </CustomModal>
        <View style={[Layout.fill, styles.checkListWrapper]}>
          <TouchableWithoutFeedback onPress={() => setVisibleModal(true)}>
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Gutters.tinyBMargin,
                {width: 70},
              ]}>
              <Icon name="filter-alt" size={20} />
              <Text style={Fonts.textSmall}>{t('common.filters.title')}</Text>
            </View>
          </TouchableWithoutFeedback>
          {loading ? (
            <ItemListSkeleton />
          ) : (
            <React.Fragment>
              {checklist?.length === 0 ? (
                <View
                  style={[
                    Layout.fill,
                    Layout.colCenter,
                    Layout.justifyContentCenter,
                    Layout.alignItemsCenter,
                  ]}>
                  <Icon
                    name="search-off"
                    size={150}
                    color={Colors.pm}
                    style={[Gutters.smallBMargin]}
                  />
                  <Text style={[Fonts.textSmall, {textAlign: 'center'}]}>
                    {t('checklists.no_found')}
                  </Text>
                </View>
              ) : (
                <View style={[Layout.fill]}>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={checklist}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                  />
                </View>
              )}
            </React.Fragment>
          )}
        </View>
      </View>
    </View>
  );
};

export default Container;
