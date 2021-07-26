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
import CustomModal from '../../components/Modal';
import Filters from '../../components/Filters/Filters';
import {Button} from 'react-native';

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
  const [visibleModal, setVisibleModal] = useState();
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
  });
  const {Gutters, Layout, Fonts} = useTheme();

  const user = useSelector(userSelector);

  let firebaseQuery;

  if (user.role === 'admin') {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', filters.state)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  } else {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', filters.state)
      .where('workersId', 'array-contains', user.uid)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  }

  const [values, loading] = useCollectionData(firebaseQuery, {
    idField: 'id',
  });

  const incidencesList = values
    ?.filter((item) => item.id !== 'stats')
    ?.filter((incidence) =>
      filters?.houses?.length > 0
        ? filters?.houses.includes(incidence.houseId)
        : true,
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
      <CustomModal
        visible={visibleModal}
        setVisible={setVisibleModal}
        size={0.7}>
        <Filters
          activeFilters={{
            houses: true,
            workers: false,
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

      {loading ? (
        <ItemListSkeleton />
      ) : (
        <View style={[Layout.fill]}>
          <Button title="Filtros" onPress={() => setVisibleModal(true)} />
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
