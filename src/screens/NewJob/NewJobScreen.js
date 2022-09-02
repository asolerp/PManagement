import React, {useState, useCallback, useEffect, useContext} from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import JobForm from '../../components/Forms/Jobs/JobForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

// Firebase
import {newJob} from '../../firebase/newJob';
import {LoadingModalContext} from '../../context/loadinModalContext';

import {jobSelector, resetForm} from '../../Store/JobForm/jobFormSlice';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  DASHBOARD_OWNER_SCREEN_KEY,
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

  const {t} = useTranslation();
  const job = useSelector(jobSelector);
  const {updateFirebase} = useUpdateFirebase(JOBS);

  const {setVisible, isVisible} = useContext(LoadingModalContext);
  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleSubmit = async () => {
    try {
      setVisible(true);
      const newJobForm = {
        observations: job?.observations || 'Sin observaciones',
        date: job?.date?._i,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value[0],
        task: job?.task,
        done: false,
      };
      await newJob(newJobForm);
    } catch (err) {
      error({
        message: 'Algo ha salido mal, lo sentimos',
        track: true,
        asToast: true,
      });
    } finally {
      setVisible(false);
      cleanForm();
      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: JOBS_SCREEN_KEY,
      });
    }
  };

  const handleEdit = async () => {
    try {
      setVisible(true);
      const editedForm = {
        observations: job?.observations,
        date: job?.date?._i || job?.date,
        workers: job?.workers?.value,
        workersId: job?.workers?.value.map((worker) => worker.id),
        houseId: job?.house?.value[0].id,
        house: job?.house?.value[0],
        task: job?.task,
        done: false,
      };
      await updateFirebase(docId, editedForm);
    } catch (err) {
      error({
        message: 'Algo ha salido mal, lo sentimos',
        track: true,
        asToast: true,
      });
    } finally {
      setVisible(false);
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
            openScreenWithPush(HOME_ADMIN_STACK_KEY, {
              screen: DASHBOARD_OWNER_SCREEN_KEY,
            });
          }}>
          <View>
            <Icon name="close" size={25} />
          </View>
        </TouchableWithoutFeedback>
      }
      footer={
        <CustomButton
          disabled={!job?.workers || !job?.house || !job?.date}
          styled="rounded"
          loading={isVisible}
          title={edit ? t('common.edit') : t('common.create')}
          onPress={() => (edit ? handleEdit() : handleSubmit())}
        />
      }
      titleProps={{
        title: t('newJob.desc_title', {job: taskName.toLowerCase()}),
        subPage: true,
      }}>
      <KeyboardAwareScrollView>
        <JobForm docId={docId} edit={edit} />
      </KeyboardAwareScrollView>
    </PageLayout>
  );
};

export default NewJobScreen;
