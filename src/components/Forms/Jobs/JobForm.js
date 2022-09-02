import React, {useState, useEffect, useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {Text, View, TextInput, StyleSheet} from 'react-native';

import InputGroup from '../../../components/Elements/InputGroup';
import DynamicSelectorList from '../../../components/DynamicSelectorList';

import moment from 'moment';
import 'moment/locale/es';

// Firebase
import firestore from '@react-native-firebase/firestore';
import DateSelector from './DateSelector';
import CustomInput from '../../Elements/CustomInput';
import {
  dateSelector,
  houseSelector,
  observationsSelector,
  setForm,
  setEditableForm,
  workersSelector,
} from '../../../Store/JobForm/jobFormSlice';
import {JOBS} from '../../../utils/firebaseKeys';
import {useTranslation} from 'react-i18next';
import {BottomModal} from '../../Modals/BottomModal';
import {Spacer} from '../../Elements/Spacer';
import {commonStyles} from '../../../styles/input';

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
  newJob: {
    textAlign: 'center',
    backgroundColor: 'red',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F8AA3',
  },
});

const JobForm = ({docId, edit}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const date = useSelector(dateSelector);
  const observations = useSelector(observationsSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setForm({label, value})),
    [dispatch],
  );

  const setEditableFormAction = useCallback(
    (jobToEdit) => dispatch(setEditableForm(jobToEdit)),
    [dispatch],
  );

  // Form State
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getJob = async () => {
      const jobToEdit = await firestore().collection(JOBS).doc(docId).get();
      const {date, house, workers, observations} = jobToEdit.data();
      setEditableFormAction({
        date: date.toDate(),
        house: {
          value: house,
        },
        workers: {
          value: workers,
        },
        observations,
      });
    };
    if (edit) {
      getJob();
    }
  }, [edit, docId, setEditableFormAction]);

  const modalSwitcher = (modal) => {
    switch (modal) {
      case 'houses': {
        return ListDynamicHouse();
      }
      case 'workers': {
        return ListDynamicWorkers();
      }
      case 'date': {
        return DateTimeSelector();
      }
      default: {
        return ListDynamicWorkers();
      }
    }
  };

  const DateTimeSelector = () => (
    <DateSelector
      get={date || null}
      set={(date) => setInputFormAction('date', date)}
      closeModal={() => setModalVisible(false)}
    />
  );

  const ListDynamicHouse = () => (
    <DynamicSelectorList
      collection="houses"
      store="jobForm"
      searchBy="houseName"
      schema={{img: 'houseImage', name: 'houseName'}}
      get={house?.value || []}
      set={(house) => setInputFormAction('house', {...house, value: house})}
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
      get={workers?.value}
      set={(workers) =>
        setInputFormAction('workers', {...workers, value: workers})
      }
      multiple={true}
      closeModal={() => setModalVisible(false)}
    />
  );

  return (
    <View style={[styles.newJobScreen]}>
      <BottomModal
        isVisible={modalVisible}
        onClose={(event) => {
          setModalVisible(false);
        }}
        swipeDirection={null}>
        {modalContent && modalSwitcher(modalContent)}
      </BottomModal>

      <CustomInput
        title={t('common.date')}
        subtitle={
          date && (
            <Text style={styles.subtitle}>{moment(date).format('LLL')}</Text>
          )
        }
        iconProps={{name: 'alarm', color: '#55A5AD'}}
        onPress={() => {
          setModalContent('date');
          setModalVisible(true);
        }}
      />
      <Spacer space={4} />
      <CustomInput
        title={t('common.asigned_to')}
        subtitle={
          workers && (
            <View style={{flexDirection: 'row'}}>
              {workers?.value?.map((worker, i) => (
                <View key={worker.id} style={{flexDirection: 'row'}}>
                  <Text style={styles.subtitle}>{worker.firstName}</Text>
                  {workers?.value?.length - 1 !== i && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
                </View>
              ))}
            </View>
          )
        }
        iconProps={{name: 'alarm', color: '#55A5AD'}}
        onPress={() => {
          setModalContent('workers');
          setModalVisible(true);
        }}
      />
      <Spacer space={4} />

      <CustomInput
        title={t('common.house')}
        subtitle={
          house && (
            <View style={{flexDirection: 'row'}}>
              {house?.value?.map((house, i) => (
                <View key={house.id}>
                  <Text style={styles.subtitle}>{house.houseName}</Text>
                </View>
              ))}
            </View>
          )
        }
        iconProps={{name: 'house', color: '#55A5AD'}}
        onPress={() => {
          setModalContent('houses');
          setModalVisible(true);
        }}
      />
      <Spacer space={4} />

      <TextInput
        multiline
        numberOfLines={10}
        style={[commonStyles.input, {height: 120}]}
        placeholder={t('common.observations')}
        onChangeText={(text) => setInputFormAction('observations', text)}
        value={observations}
      />
    </View>
  );
};

export default JobForm;
