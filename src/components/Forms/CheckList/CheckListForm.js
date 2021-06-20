import React, {useState, useCallback} from 'react';

import {BottomModal, ModalContent} from 'react-native-modals';
import {Text, View, TextInput, StyleSheet} from 'react-native';

// Redux
import {useDispatch, useSelector} from 'react-redux';

// UI
import InputGroup from '../../Elements/InputGroup';
import DynamicSelectorList from '../../DynamicSelectorList';
import DateSelector from '../Jobs/DateSelector';
import CustomInput from '../../Elements/CustomInput';
import CheckBox from '@react-native-community/checkbox';

// Utils
import moment from 'moment';
import 'moment/locale/es';
import {useTheme} from '../../../Theme';

// Styles
import {defaultLabel} from '../../../styles/common';

// Firebase
import {useGetFirebase} from '../../../hooks/useGetFirebase';
import {DARK_BLUE, PM_COLOR} from '../../../styles/colors';
import {
  houseSelector,
  observationsSelector,
  workersSelector,
  setForm,
  checksSelector,
  setCheck,
  setAllChecks,
} from '../../../Store/CheckList/checkListSlice';
import {Colors} from '../../../Theme/Variables';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Label from '../../Elements/Label';
import {set} from 'date-fns';

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
  const {Layout} = useTheme();
  const {list} = useGetFirebase('checks');

  const [house, setHouse] = useState();
  const [workers, setWorkers] = useState();
  const [observations, setObservations] = useState();
  const [checks, setChecks] = useState();

  const setToggleCheckBox = (item, newValue) => {
    setChecks({
      ...checks,
      [item.id]: {
        ...item,
        check: newValue,
      },
    });
  };

  const allChecks = list.reduce(
    (acc, check) => ({
      ...acc,
      [check.id]: {...check, check: true},
    }),
    {},
  );
  const setAllChecksActions = () => {
    setChecks(allChecks);
  };

  const removeAllChecksActions = () => {
    setChecks({});
  };

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
      get={house || []}
      set={setHouse}
      closeModal={() => setModalVisible(false)}
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
      get={workers}
      set={setWorkers}
      multiple={true}
      closeModal={() => setModalVisible(false)}
    />
  );

  const CheckItem = ({item}) => {
    return (
      <View style={styles.checkWrapper}>
        <CheckBox
          onTintColor={Colors.leftBlue}
          onCheckColor={Colors.leftBlue}
          disabled={false}
          value={checks?.[item.id]?.check || false}
          boxType="square"
          onValueChange={(newValue) => setToggleCheckBox(item, newValue)}
        />
        <Text style={styles.checkStyle}>{item.title}</Text>
      </View>
    );
  };

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
              {house?.map((house, i) => (
                <View key={house.id}>
                  <Text style={styles.subtitle}>{house.houseName}</Text>
                  {house?.length > 1 && (
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
            <View style={[Layout.row]}>
              {workers?.map((worker, i) => (
                <View style={[Layout.rowCenter]} key={worker.id}>
                  <Text style={styles.subtitle}>{worker.firstName}</Text>
                  {workers?.length - 1 !== i && (
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
          onChangeText={setObservations}
          value={observations}
        />
      </InputGroup>
      <View
        style={[
          Layout.fill,
          Layout.rowCenter,
          Layout.justifyContentSpaceBetween,
        ]}>
        <Text style={{...defaultLabel, marginTop: 10}}>
          Checklist a realizar
        </Text>
        <View style={[Layout.rowCenter, Layout.justifyContentCenter]}>
          <TouchableOpacity
            onPress={() => setAllChecksActions()}
            style={styles.labelWrapper}>
            <Label title="Todos" color={Colors.pm} active={true} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeAllChecksActions()}
            style={styles.labelWrapper}>
            <Label title="Ninguno" color={Colors.danger} active={true} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.checkListWrapper}>
        {list?.map((check) => (
          <CheckItem item={check} key={check.id} />
        ))}
      </View>
    </View>
  );
};

export default CheckListForm;
