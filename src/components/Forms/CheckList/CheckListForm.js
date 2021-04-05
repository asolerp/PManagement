import React, {useState, useCallback} from 'react';

import {BottomModal, ModalContent} from 'react-native-modals';
import {Text, View, TextInput, StyleSheet} from 'react-native';

// Redux
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {setInputForm} from '../../../store/checkListFormAction';

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
    backgroundColor: '#126D9B',
  },
  checkStyle: {
    marginLeft: 10,
    fontSize: 18,
  },
});

const CheckListForm = () => {
  const dispatch = useDispatch();

  const {list, loading, error} = useGetFirebase('checks');

  console.log(list);

  const {checklist} = useSelector(
    ({checklistForm: {checklist}}) => ({checklist}),
    shallowEqual,
  );

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setInputForm(label, value)),
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
      get={checklist?.house?.value || []}
      set={(house) =>
        setInputFormAction('house', {...checklist?.house, value: house})
      }
    />
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
              {checklist?.house?.value?.map((house, i) => (
                <View key={house.id}>
                  <Text style={styles.subtitle}>{house.houseName}</Text>
                  {checklist?.house?.value?.length - 1 !== i && (
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
        ✅ Check list a realizar
      </Text>
      <View style={styles.checkListWrapper}>
        {list?.map((check) => (
          <View style={styles.checkWrapper}>
            <View style={styles.checkDot} />
            <Text style={styles.checkStyle}>{check.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CheckListForm;
