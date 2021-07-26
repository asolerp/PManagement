import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import StatusIncidence from '../../components/Filters/StatusIncidence';
import IncidenceItem from '../../components/Items/IncidenceItem';

import {defaultLabel, marginBottom} from '../../styles/common';
import ItemListSkeleton from '../../components/Skeleton/ItemListSkeleton';
import HouseFilter from '../../components/Filters/HouseFilter';
import {useTheme} from '../../Theme';

import sortByDate from '../../utils/sorts';
import TimeFilter from '../../components/Filters/TimeFilter';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

import {openScreenWithPush} from '../../Router/utils/actions';
import {INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {parseTimeFilter} from '../../utils/parsers';

const styles = StyleSheet.create({
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    zIndex: 10,
  },
  todayStyle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

const Container = () => {
  const [state, setState] = useState(false);
  const [timeFilter, setTimeFilter] = useState(parseTimeFilter('all'));
  const [filterHouses, setFilterHouses] = useState([]);
  const {Gutters, Layout, Fonts} = useTheme();

  const user = useSelector(userSelector);

  let firebaseQuery;

  if (user.role === 'admin') {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', state)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end));
  } else {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', state)
      .where('workersId', 'array-contains', user.uid)
      .where('date', '>', new Date(timeFilter.start))
      .where('date', '<', new Date(timeFilter.end));
  }

  const [values, loading] = useCollectionData(firebaseQuery, {
    idField: 'id',
  });

  const incidencesList = values
    ?.filter((item) => item.id !== 'stats')
    ?.filter((incidence) =>
      filterHouses.length > 0 ? filterHouses.includes(incidence.houseId) : true,
    )
    ?.sort((a, b) => sortByDate(a, b, 'asc'));

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(INCIDENCE_SCREEN_KEY, {
        incidenceId: item.id,
      });
    };
    return <IncidenceItem incidence={item} onPress={handlePressIncidence} />;
  };

  return (
    <View style={[Layout.fill, Gutters.mediumTMargin]}>
      <TimeFilter
        onChangeFilter={setTimeFilter}
        state={timeFilter}
        withAll={true}
      />
      <View style={[Gutters.tinyTMargin, Gutters.smallBMargin]}>
        <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
      </View>
      <View style={[styles.filterWrapper, Gutters.smallBMargin]}>
        <StatusIncidence onChangeFilter={setState} state={state} />
      </View>

      {loading ? (
        <ItemListSkeleton />
      ) : (
        <View style={[Layout.fill]}>
          {incidencesList?.length > 0 ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={incidencesList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View
              style={[
                Layout.fill,
                Layout.rowCenter,
                Layout.justifyContentCenter,
                Layout.alignItemsCenter,
              ]}>
              <Text style={[Fonts.textSmall, {textAlign: 'center'}]}>
                No hay incidencias
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Container;
