import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import Modal from 'react-native-modal';
import HouseFilter from './Filters/HouseFilter';

import {setFilterByType} from '../store/filterActions';
import {subDays, subHours} from 'date-fns';

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,

    borderTopStartRadius: 20,
    height: '50%',
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
});

const GlobalFilters = ({storage}) => {
  const dispatch = useDispatch();
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const filters = useSelector(
    ({
      filters: {
        [storage]: {houses},
      },
    }) => ({houses}),
    shallowEqual,
  );

  const HousesFilter = () => (
    <HouseFilter
      houses={filters?.houses}
      addHouse={setFilterByTypeActionHouses}
    />
  );

  const modalSwitcher = (modal) => {
    switch (modal) {
      case 'houses': {
        return HousesFilter();
      }
      default: {
        return HousesFilter();
      }
    }
  };

  const setFilterByTypeActionHouses = useCallback(
    (value) => dispatch(setFilterByType(storage, 'houses', value)),
    [dispatch, storage],
  );

  const setFilterByTypeActionDates = useCallback(
    (value) => dispatch(setFilterByType(storage, 'when', value)),
    [dispatch, storage],
  );

  return (
    <React.Fragment>
      <Modal
        onBackdropPress={() => setModalVisible(false)}
        isVisible={modalVisible}
        style={styles.view}>
        <View style={styles.content}>
          {modalContent && modalSwitcher(modalContent)}
        </View>
      </Modal>
      <View>
        <Text>Filtros</Text>
        <TouchableOpacity
          onPress={() => {
            setModalContent('houses');
            setModalVisible(true);
          }}>
          <Text>Casas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setFilterByTypeActionDates(subDays(new Date(), 1));
          }}>
          <Text>Esta semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setFilterByTypeActionDates(subDays(new Date(), 15));
          }}>
          <Text>Este mes</Text>
        </TouchableOpacity>
        <Text>Hace más de un mes</Text>
      </View>
    </React.Fragment>
  );
};

export default GlobalFilters;
