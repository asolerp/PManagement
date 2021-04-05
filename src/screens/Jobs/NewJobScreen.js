import React, {useState, useCallback} from 'react';
import {
  View,
  Keyboard,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import JobForm from '../../components/Forms/Jobs/JobForm';
import TaskForm from '../../components/Forms/Jobs/TaskJob';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PagetLayout from '../../components/PageLayout';

// Firebase
import {resetForm} from '../../store/jobFormActions';
import {newJob} from '../../firebase/newJob';

const HideKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const NewJobScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {taskName} = route.params;
  const [loading, setLoading] = useState();

  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newJobForm = {
        observations: job?.observations,
        date: job?.date?._d,
        time: job?.time,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value,
        task: job?.task,
        priority: job?.priority?.value,
        done: false,
      };
      await newJob(newJobForm);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      cleanForm();
      navigation.navigate('Jobs');
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
          title="Crear trabajo"
          onPress={() => handleSubmit()}
        />
      }
      titleProps={{
        title: `Nuevo trabajo de ${taskName.toLowerCase()}`,
        subPage: true,
      }}>
      <View style={styles.jobScreen}>
        <KeyboardAwareScrollView>
          <JobForm />
        </KeyboardAwareScrollView>
      </View>
    </PagetLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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

export default NewJobScreen;
