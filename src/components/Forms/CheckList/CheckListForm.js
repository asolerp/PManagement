import React, {useState, useCallback} from 'react';

import {BottomModal, ModalContent} from 'react-native-modals';
import {Text, View, TextInput, StyleSheet, FlatList} from 'react-native';

// Redux
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

// UI
import InputGroup from '../../Elements/InputGroup';
import DynamicSelectorList from '../../DynamicSelectorList';
import DateSelector from '../Jobs/DateSelector';
import CustomInput from '../../Elements/CustomInput';

// Utils
import moment from 'moment';
import 'moment/locale/es';

// Styles
import {defaultLabel} from '../../../styles/common';

// Firebase
import {useGetFirebase} from '../../../hooks/useGetFirebase';
import {DARK_BLUE, PM_COLOR} from '../../../styles/colors';
import {
  houseNewChecklistSelector,
  observationsNewChecklistSelector,
  setForm,
  workersNewCheckListSelector,
} from '../../../Store/CheckList/checkListSlice';

moment.locale('es');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    color: '#2A7BA5',
  },
  newJobScreen: {
    flex: 1,
    height: '100%',
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  asignList: {},
  inputRecurrenteWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  inputRecurrente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanButton: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4F8AA3',
  },
  checkListWrapper: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  checkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: PM_COLOR,
  },
  checkStyle: {
    marginLeft: 10,
    fontSize: 18,
    color: DARK_BLUE,
  },
});

const CheckListForm = () => {
  const dispatch = useDispatch();

  const {list, loading, error} = useGetFirebase('checks');

  console.log(list);

  const houseSelector = useSelector(houseNewChecklistSelector);
  const workersSelector = useSelector(workersNewCheckListSelector);
  const observationSelector = useSelector(observationsNewChecklistSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setForm({label, value})),
    [dispatch],
  );

  // Form State
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const modalSwitcher = (modal) => {
    switch (modal) {
      case 'houses': {
        return ListDynamicHouse();
      }
      case 'worker': {
        return ListDynamicWorkers();
      }
      case 'date': {
        return DateTimeSelector();
      }
      default: {
        return ListDynamicHouse();
      }
    }
  };

  const DateTimeSelector = () => (
    <DateSelector closeModal={() => setModalVisible(false)} />
  );

  const ListDynamicHouse = () => (
    <DynamicSelectorList
      collection="houses"
      store="jobForm"
      searchBy="houseName"
      schema={{img: 'houseImage', name: 'houseName'}}
      get={houseSelector?.value || []}
      set={(house) =>
        setInputFormAction('house', {...houseSelector, value: house})
      }
    />
  );

  const ListDynamicWorkers = () => (
    <DynamicSelectorList
      collection="users"
      store="jobForm"
      where={[
        {
          label: 'role',
          operator: '==',
          condition: 'worker',
        },
      ]}
      searchBy="firstName"
      schema={{img: 'profileImage', name: 'firstName'}}
      get={workersSelector?.value}
      set={(ws) =>
        setInputFormAction('workers', {...workersSelector, value: ws})
      }
      multiple={true}
    />
  );

  const renderItem = ({item}) => (
    <View style={styles.checkWrapper}>
      <View style={styles.checkDot} />
      <Text style={styles.checkStyle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={[styles.newJobScreen]}>
      <BottomModal
        modalStyle={{borderRadius: 30}}
        height={modalContent === 'date' ? 0.5 : 0.9}
        visible={modalVisible}
        onSwipeOut={(event) => {
          setModalVisible(false);
        }}
        onTouchOutside={() => {
          setModalVisible(false);
        }}>
        <ModalContent style={{flex: 1, alignItems: 'center'}}>
          {modalContent && modalSwitcher(modalContent)}
        </ModalContent>
      </BottomModal>
      <InputGroup>
        <CustomInput
          title="Casa"
          subtitle={
            <View style={{flexDirection: 'row'}}>
              {houseSelector?.value?.map((house, i) => (
                <View key={house.id}>
                  <Text style={styles.subtitle}>{house.houseName}</Text>
                  {houseSelector?.value?.length - 1 !== i && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
                </View>
              ))}
            </View>
          }
          iconProps={{name: 'house', color: '#55A5AD'}}
          onPress={() => {
            setModalContent('houses');
            setModalVisible(true);
          }}
        />
      </InputGroup>
      <InputGroup>
        <CustomInput
          title="Trabajador"
          subtitle={
            <View style={{flexDirection: 'row'}}>
              {workersSelector?.value?.map((worker, i) => (
                <View key={worker.id}>
                  <Text style={styles.subtitle}>{worker.firstName}</Text>
                  {workersSelector?.value?.length - 1 !== i && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
                </View>
              ))}
            </View>
          }
          iconProps={{name: 'people', color: '#55A5AD'}}
          onPress={() => {
            setModalContent('worker');
            setModalVisible(true);
          }}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          multiline
          numberOfLines={10}
          style={{height: 120}}
          placeholder="Observaciones"
          onChangeText={(text) => setInputFormAction('observations', text)}
          value={checklist?.observations}
        />
      </InputGroup>
      <Text style={{...defaultLabel, marginTop: 10}}>
        Check list a realizar
      </Text>
      <View style={styles.checkListWrapper}>
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

export default CheckListForm;
