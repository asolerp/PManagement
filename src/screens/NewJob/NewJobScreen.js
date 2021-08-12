import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import JobForm from '../../components/Forms/Jobs/JobForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

// Firebase
import {newJob} from '../../firebase/newJob';

import {jobSelector, resetForm} from '../../Store/JobForm/jobFormSlice';
import {openScreenWithPush, popScreen} from '../../Router/utils/actions';
import {Colors} from '../../Theme/Variables';
import {
  HOME_ADMIN_STACK_KEY,
  JOBS_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {JOBS} from '../../utils/firebaseKeys';
import {useTranslation} from 'react-i18next';
import {error} from '../../lib/logging';

const NewJobScreen = ({route}) => {
  const dispatch = useDispatch();
  const {taskName, docId, edit} = route.params;
  const [loading, setLoading] = useState();
  const {t} = useTranslation();
  const job = useSelector(jobSelector);
  const {updateFirebase} = useUpdateFirebase(JOBS);

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newJobForm = {
        observations: job?.observations,
        date: job?.date?._i,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value,
        task: job?.task,
        done: false,
      };
      await newJob(newJobForm);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
      cleanForm();
      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: JOBS_SCREEN_KEY,
      });
    }
  };

  const handleEdit = async () => {
    console.log(job?.task);
    try {
      setLoading(true);
      const editedForm = {
        observations: job?.observations,
        date: job?.date?._i || job?.date,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value,
        task: job?.task,
        done: false,
      };
      await updateFirebase(docId, editedForm);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
      cleanForm();
      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: JOBS_SCREEN_KEY,
      });
    }
  };

  return (
    <PageLayout
      safe
      backButton
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} color={Colors.white} />
          </View>
        </TouchableWithoutFeedback>
      }
      footer={
        <CustomButton
          styled="rounded"
          loading={loading}
          title={edit ? t('common.edit') : t('common.create')}
          onPress={() => (edit ? handleEdit() : handleSubmit())}
        />
      }
      titleProps={{
        title: t('newJob.desc_title', {job: taskName.toLowerCase()}),
        subPage: true,
      }}>
      <SafeAreaView style={styles.jobScreen}>
        <KeyboardAwareScrollView>
          <JobForm docId={docId} edit={edit} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
