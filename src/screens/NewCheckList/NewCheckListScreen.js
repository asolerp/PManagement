import React, {useState, useCallback} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useAddFirebase} from '../../hooks/useAddFirebase';

import {
  checksSelector,
  dateSelector,
  houseSelector,
  observationsSelector,
  resetForm,
  workersSelector,
} from '../../Store/CheckList/checkListSlice';
import {popScreen} from '../../Router/utils/actions';
import {Colors} from '../../Theme/Variables';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import useRecursiveDelete from '../../utils/useRecursiveDelete';

const NewCheckListScreen = ({route, navigation}) => {
  const {docId, edit} = route.params;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState();

  const checks = useSelector(checksSelector);
  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const observations = useSelector(observationsSelector);
  const date = useSelector(dateSelector);

  const {addFirebase} = useAddFirebase();
  const {updateFirebase} = useUpdateFirebase(CHECKLISTS);
  const {recursiveDelete} = useRecursiveDelete({
    path: `${CHECKLISTS}/${docId}/checks`,
    collection: CHECKLISTS,
  });

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const cleanForm = () => {
    resetFormAction();
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      const editCheckListForm = {
        observations: observations,
        date: date?._i,
        workers: workers?.value,
        workersId: workers?.value?.map((worker) => worker.id),
        houseId: house?.value[0].id,
        house: house?.value,
        total: Object.entries(checks).filter(([key, value]) => value.check)
          .length,
        finished: false,
        done: 0,
      };
      await updateFirebase(docId, editCheckListForm);
      await recursiveDelete();
      await Promise.all(
        Object.entries(checks)
          .filter(([key, value]) => value.check)
          .map(([key, value]) =>
            addFirebase(`checklists/${docId}/checks`, {
              title: value.title,
              originalId: value.originalId,
              numberOfPhotos: 0,
              done: value.done,
              worker: null,
              date: null,
            }),
          ),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      cleanForm();
      popScreen();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newCheckListForm = {
        observations: observations || 'Sin observaciones',
        date: date?._i,
        workers: workers?.value,
        workersId: workers?.value?.map((worker) => worker.id),
        houseId: house?.value[0].id,
        house: house?.value,
        total: Object.entries(checks).filter(([key, value]) => value.check)
          .length,
        finished: false,
        send: false,
        done: 0,
      };
      const newCheckList = await addFirebase('checklists', newCheckListForm);
      await Promise.all(
        Object.entries(checks)
          .filter(([key, value]) => value.check)
          .map(([key, value]) =>
            addFirebase(`checklists/${newCheckList.id}/checks`, {
              title: value.title,
              originalId: value.id,
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
      popScreen();
    }
  };

  return (
    <PageLayout
      safe
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
          loading={loading}
          styled="rounded"
          title={edit ? 'Editar' : 'Crear'}
          onPress={() => (edit ? handleEdit() : handleSubmit())}
        />
      }
      titleProps={{
        title: 'Nuevo checklist',
        subPage: true,
      }}>
      <View style={styles.jobScreen}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <CheckListForm edit={edit} docId={docId} />
        </KeyboardAwareScrollView>
      </View>
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

export default NewCheckListScreen;
