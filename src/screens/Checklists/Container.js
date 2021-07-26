import React, {useState} from 'react';

import {View, FlatList, Text, StyleSheet} from 'react-native';
import CheckItem from '../../components/CheckItem';

// Styles
import {defaultLabel, marginBottom} from '../../styles/common';

import HouseFilter from '../../components/Filters/HouseFilter';
import {useTheme} from '../../Theme';
import ItemListSkeleton from '../../components/Skeleton/ItemListSkeleton';
import TimeFilter from '../../components/Filters/TimeFilter';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {openScreenWithPush} from '../../Router/utils/actions';
import {CHECK_SCREEN_KEY, CHECK_STACK_KEY} from '../../Router/utils/routerKeys';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import StatusIncidence from '../../components/Filters/StatusIncidence';
import {parseTimeFilter} from '../../utils/parsers';

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
  const {Gutters, Layout, Fonts} = useTheme();
  const [filterHouses, setFilterHouses] = useState([]);
  const [state, setState] = useState(false);
  const [timeFilter, setTimeFilter] = useState(parseTimeFilter('week'));

  const [values, loading] = useCollectionData(
    firestore()
      .collection(CHECKLISTS)
      .where('finished', '==', state)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end)),
    {
      idField: 'id',
    },
  );

  const checklist = values?.filter((check) =>
    filterHouses.length > 0 ? filterHouses.includes(check.houseId) : true,
  );

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

  const noFoundHouses = (checklist) =>
    checklist?.filter((check) =>
      filterHouses.length > 0 ? filterHouses.includes(check.houseId) : true,
    ).length === 0;

  return (
    <View style={[Layout.fill]}>
      <View style={[Layout.fill, styles.filterWrapper]}>
        <View style={[Layout.fill, styles.checkListWrapper]}>
          <TimeFilter
            onChangeFilter={setTimeFilter}
            state={timeFilter}
            withAll={true}
          />
          <View
            style={[
              styles.housesWrapper,
              Gutters.tinyTMargin,
              Gutters.smallBMargin,
            ]}>
            <HouseFilter
              houses={filterHouses}
              onClickHouse={(houses) => setFilterHouses(houses)}
            />
          </View>
          <View
            style={[
              Layout.row,
              Layout.justifyContentSpaceBetween,
              Gutters.smallBMargin,
            ]}>
            <StatusIncidence onChangeFilter={setState} state={state} />
          </View>
          {noFoundHouses(values) && (
            <View style={[Layout.rowCenter]}>
              <Text style={[Fonts.textSmall]}>
                No hay ningún checklist con esta selección de casas
              </Text>
            </View>
          )}
          {loading ? (
            <ItemListSkeleton />
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
        </View>
      </View>
    </View>
  );
};

export default Container;
