import React, {useState, useCallback} from 'react';
import {
  View,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PagetLayout from '../../components/PageLayout';

// Firebase
import {useAddFirebase} from '../../hooks/useAddFirebase';
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {LOW_GREY} from '../../styles/colors';
import {
  houseSelector,
  observationsSelector,
  resetForm,
  workersSelector,
} from '../../Store/CheckList/checkListSlice';

const HideKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const NewCheckListJobScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState();

  const {list: checks} = useGetFirebase('checks');

  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const observations = useSelector(observationsSelector);

  const {addFirebase} = useAddFirebase();

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newCheckListForm = {
        observations: observations,
        date: new Date(),
        workers: workers?.value,
        workersId: workers?.value?.map((worker) => worker.id),
        houseId: house?.value[0].id,
        house: house?.value,
        total: checks.length,
        finished: false,
        done: 0,
      };
      const newCheckList = await addFirebase('checklists', newCheckListForm);
      await Promise.all(
        checks.map((check) =>
          addFirebase(`checklists/${newCheckList.id}/checks`, {
            title: check.title,
            numberOfPhotos: 0,
            done: false,
            worker: null,
            date: null,
          }),
        ),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      cleanForm();
      navigation.navigate('CheckList');
    }
  };

  return (
    <PagetLayout
      titleLefSide={
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <View style={styles.iconWrapper}>
            <Icon name="arrow-back" size={25} color="#5090A5" />
          </View>
        </TouchableOpacity>
      }
      footer={
        <CustomButton
          loading={loading}
          title="Crear checklist"
          onPress={() => handleSubmit()}
        />
      }
      titleProps={{
        title: 'Nuevo checklist',
        subPage: true,
      }}>
      <View style={styles.jobScreen}>
        <KeyboardAwareScrollView>
          <CheckListForm />
        </KeyboardAwareScrollView>
      </View>
    </PagetLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOW_GREY,
  },
  newJobScreen: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  jobBackScreen: {
    flex: 1,
  },
  jobScreen: {
    flex: 1,
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
    paddingTop: 20,

    height: '100%',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  asignList: {
    flex: 1,
  },
  inputRecurrenteWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  inputRecurrente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBarStyle: {
    backgroundColor: 'transparent',
    color: 'black',
  },
  tabBarLabelStyle: {color: 'black', fontWeight: 'bold'},
  tabIndicator: {
    backgroundColor: '#2A7BA5',
    width: 10,
    height: 10,
    borderRadius: 100,
  },
});

export default NewCheckListJobScreen;
