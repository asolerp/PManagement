import React, {useState, useCallback} from 'react';
import {View, StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';

import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import JobForm from '../../components/Forms/Jobs/JobForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

// Firebase
import {newJob} from '../../firebase/newJob';
import {LOW_GREY} from '../../styles/colors';
import {jobSelector, resetForm} from '../../Store/JobForm/jobFormSlice';

const NewJobScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {taskName} = route.params;
  const [loading, setLoading] = useState();

  const job = useSelector(jobSelector);

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newJobForm = {
        observations: job?.observations,
        date: job?.dateTime?.date,
        time: job?.dateTime?.time,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value,
        task: job?.task,
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
    <PageLayout
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
          styled="rounded"
          loading={loading}
          title="Crear trabajo"
          onPress={() => handleSubmit()}
        />
      }
      titleProps={{
        title: `Nuevo trabajo de ${taskName.toLowerCase()}`,
        subPage: true,
      }}>
      <SafeAreaView style={styles.jobScreen}>
        <KeyboardAwareScrollView>
          <JobForm />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </PageLayout>
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

export default NewJobScreen;