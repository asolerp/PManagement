import React, {useState, useCallback, useEffect} from 'react';

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
import firestore from '@react-native-firebase/firestore';

import {DARK_BLUE, PM_COLOR} from '../../../styles/colors';
import {
  houseSelector,
  observationsSelector,
  workersSelector,
  setForm,
  setEditableForm,
  checksSelector,
  setCheck,
  setEditableChecks,
  setAllChecks,
  dateSelector,
} from '../../../Store/CheckList/checkListSlice';
import {Colors} from '../../../Theme/Variables';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import Label from '../../Elements/Label';

import {CHECKLISTS} from '../../../utils/firebaseKeys';
import {useTranslation} from 'react-i18next';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {BottomModal} from '../../Modals/BottomModal';

import {getLocales} from 'react-native-localize';
import {Spacer} from '../../Elements/Spacer';

const CheckListForm = ({edit, docId}) => {
  const dispatch = useDispatch();
  const {Layout} = useTheme();
  const [list] = useCollectionData(firestore().collection('checks'), {
    idField: 'id',
  });
  const {t} = useTranslation();
  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const observations = useSelector(observationsSelector);
  const checks = useSelector(checksSelector);
  const date = useSelector(dateSelector);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setForm({label, value})),
    [dispatch],
  );

  const setInputFormEditable = useCallback(
    (form) => dispatch(setEditableForm(form)),
    [dispatch],
  );

  const setChecksEditable = useCallback(
    (checkEditableList) => dispatch(setEditableChecks(checkEditableList)),
    [dispatch],
  );

  const setToggleCheckBox = useCallback(
    (item, newValue) => {
      dispatch(setCheck({check: item, checkState: newValue}));
    },
    [dispatch],
  );

  const allChecks = list?.reduce(
    (acc, check) => ({
      ...acc,
      [check.id]: {...check, check: true, originalId: check.id},
    }),
    {},
  );
  const setAllChecksActions = useCallback(() => {
    dispatch(setAllChecks({checks: allChecks}));
  }, [dispatch, allChecks]);

  const removeAllChecksActions = useCallback(() => {
    dispatch(setAllChecks({checks: {}}));
  }, [dispatch]);

  // Form State
  const [modalContent, setModalContent] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getDocument = async () => {
      const checkToEdit = await firestore()
        .collection(CHECKLISTS)
        .doc(docId)
        .get();
      const checks = await firestore()
        .collection(CHECKLISTS)
        .doc(docId)
        .collection('checks')
        .get();

      const checksDocs = checks.docs
        .map((doc) => doc.data())
        .map((check) => ({
          originalId: check.originalId,
          check: true,
          done: check.done,
          id: check.id,
          locale: check.locale,
          photos: check.photos,
        }))
        .reduce((acc, checkDoc) => {
          return {
            ...acc,
            [checkDoc.originalId]: checkDoc,
          };
        }, {});

      const {date, house, workers, observations} = checkToEdit.data();

      setInputFormEditable({
        date: date.toDate(),
        house: {
          value: house,
        },
        workers: {
          value: workers,
        },
        observations,
      });
      setChecksEditable({checks: checksDocs});
    };
    if (edit) {
      getDocument();
    }
  }, [edit, docId, setInputFormEditable, setChecksEditable]);

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
      set={(house) => {
        setInputFormAction('house', {...house, value: house});
        setModalVisible(false);
      }}
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
      set={(ws) => {
        setInputFormAction('workers', {...workers, value: ws});
        setModalVisible(false);
      }}
      multiple={true}
      closeModal={() => setModalVisible(false)}
    />
  );

  const CheckItem = useCallback(
    ({item}) => {
      return (
        <View style={styles.checkWrapper}>
          <CheckBox
            onTintColor={Colors.leftBlue}
            onCheckColor={Colors.leftBlue}
            disabled={false}
            value={checks?.[item.id]?.check || false}
            boxType="square"
            onValueChange={(newValue) =>
              setToggleCheckBox({...item, originalId: item.id}, newValue)
            }
          />
          <Text style={styles.checkStyle}>
            {item?.locale?.[getLocales()[0].languageCode] || item?.locale?.en}
          </Text>
        </View>
      );
    },
    [checks, setToggleCheckBox],
  );

  return (
    <View style={[styles.newJobScreen]}>
      <BottomModal
        swipeDirection={null}
        onClose={() => setModalVisible(false)}
        isVisible={modalVisible}>
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
      {console.log('HOUSE', house)}
      <CustomInput
        title={t('common.house')}
        subtitle={
          house?.value && (
            <View style={{flexDirection: 'row'}}>
              {house?.value?.map((house, i) => (
                <View key={house.id}>
                  <Text style={styles.subtitle}>{house.houseName}</Text>
                  {house?.value?.length > 1 && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
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
      {console.log('WORKERS', workers)}
      <CustomInput
        title={t('common.worker')}
        subtitle={
          workers?.value && (
            <View style={{flexDirection: 'row'}}>
              {workers?.value?.map((worker, i) => (
                <View key={worker.id} style={[Layout.row]}>
                  <Text style={styles.subtitle}>{worker.firstName}</Text>
                  {workers?.value?.length - 1 !== i && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
                </View>
              ))}
            </View>
          )
        }
        iconProps={{name: 'people', color: '#55A5AD'}}
        onPress={() => {
          setModalContent('worker');
          setModalVisible(true);
        }}
      />
      <Spacer space={4} />
      <TextInput
        multiline
        numberOfLines={10}
        style={{height: 120}}
        placeholder={t('common.observations')}
        onChangeText={(text) => setInputFormAction('observations', text)}
        value={observations}
      />
      <View
        style={[
          Layout.fill,
          Layout.rowCenter,
          Layout.justifyContentSpaceBetween,
        ]}>
        <Text style={{...defaultLabel, marginTop: 10}}>
          {t('new_checklist.check_list')}
        </Text>
        <View style={[Layout.rowCenter, Layout.justifyContentCenter]}>
          <TouchableOpacity
            onPress={() => setAllChecksActions()}
            style={styles.labelWrapper}>
            <Label title={t('common.all')} color={Colors.pm} active={true} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeAllChecksActions()}
            style={styles.labelWrapper}>
            <Label
              title={t('common.neither')}
              color={Colors.danger}
              active={true}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.checkListWrapper}>
        {list?.map((check) => (
          <CheckItem item={check} key={check.id} />
        ))}
      </ScrollView>
    </View>
  );
};

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

export default CheckListForm;
