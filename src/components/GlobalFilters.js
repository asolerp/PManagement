import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import Modal from 'react-native-modal';
import HouseFilter from './Filters/HouseFilter';
import DateSelector from './DateSelector';

import {setFilterByType} from '../store/filterActions';
import moment from 'moment';
import {defaultLabel, marginBottom} from '../styles/common';
import {GREY} from '../styles/colors';

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
        [storage]: {houses, from, to},
      },
    }) => ({houses, from, to}),
    shallowEqual,
  );

  const HousesFilter = () => (
    <HouseFilter
      houses={filters?.houses}
      addHouse={setFilterByTypeActionHouses}
    />
  );

  const DateFilter = ({date, selectDate, minimumDate, maximumDate}) => (
    <DateSelector
      date={date}
      selectDate={selectDate}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
    />
  );

  const modalSwitcher = (modal) => {
    switch (modal) {
      case 'houses': {
        return HousesFilter();
      }
      case 'from': {
        return DateFilter({
          date: filters?.from,
          selectDate: setFilterByTypeActionFromDates,
          maximumDate: filters?.to,
        });
      }
      case 'to': {
        return DateFilter({
          date: filters?.to,
          selectDate: setFilterByTypeActionToDates,
          minimumDate: filters?.from,
        });
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

  const setFilterByTypeActionFromDates = useCallback(
    (value) => dispatch(setFilterByType(storage, 'from', value)),
    [dispatch, storage],
  );

  const setFilterByTypeActionToDates = useCallback(
    (value) => dispatch(setFilterByType(storage, 'to', value)),
    [dispatch, storage],
  );

  const ItemFilterDate = ({label, value}) => (
    <View
      style={{
        opacity: value ? 1 : 0.4,
        borderColor: GREY,
        borderWidth: 1,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
      }}>
      <Text>{label}: </Text>
      {value && <Text style={{fontSize: 10}}>{value}</Text>}
    </View>
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
        <Text style={{...defaultLabel, ...marginBottom(10)}}>Filtros</Text>
        {/* <TouchableOpacity
          onPress={() => {
            setModalContent('houses');
            setModalVisible(true);
          }}>
          <Text style={marginBottom(10)}>Casas</Text>
        </TouchableOpacity> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}>
          <TouchableOpacity
            onPress={() => {
              setModalContent('from');
              setModalVisible(true);
            }}>
            <View
              style={{flexDirection: 'row', marginBottom: 10, marginRight: 10}}>
              <ItemFilterDate
                label="Desde"
                value={moment(filters?.from).format('LL')}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalContent('to');
              setModalVisible(true);
            }}>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <ItemFilterDate
                label="Hasta"
                value={moment(filters?.to).format('LL')}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
};

export default GlobalFilters;
