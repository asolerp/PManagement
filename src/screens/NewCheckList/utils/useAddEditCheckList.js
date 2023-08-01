import {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useAddFirebase} from '../../../hooks/useAddFirebase';
import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import {
  checksSelector,
  dateSelector,
  houseSelector,
  observationsSelector,
  resetForm,
  workersSelector,
} from '../../../Store/CheckList/checkListSlice';
import {CHECKLISTS} from '../../../utils/firebaseKeys';
import useRecursiveDelete from '../../../utils/useRecursiveDelete';
import Toast from 'react-native-toast-message';
import {openScreenWithPush, popScreen} from '../../../Router/utils/actions';

import firestore from '@react-native-firebase/firestore';
import {useContext} from 'react';
import {LoadingModalContext} from '../../../context/loadinModalContext';
import {
  DASHBOARD_SCREEN_KEY,
  MAIN_ADMIN_STACK_KEY,
} from '../../../Router/utils/routerKeys';

export const useAddEditCheckist = ({docId, edit}) => {
  const dispatch = useDispatch();
  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);
  const {setVisible} = useContext(LoadingModalContext);
  const cleanForm = () => {
    resetFormAction();
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const checks = useSelector(checksSelector);
  const house = useSelector(houseSelector);
  const workers = useSelector(workersSelector);
  const observations = useSelector(observationsSelector);
  const date = useSelector(dateSelector);

  const {addFirebase} = useAddFirebase();
  const {updateFirebase} = useUpdateFirebase(CHECKLISTS);

  const setAllChecks = useCallback(
    (checks) => {
      dispatch(setAllChecks({checks}));
    },
    [dispatch],
  );

  const hasFilledForm =
    !!date && Object.keys(checks).length > 0 && Object.keys(house).length;

  const handleEdit = async () => {

    console.log("Date", date)

    try {
      setLoading(true);
      setVisible(true);
      const editCheckListForm = {
        observations: observations,
        date: date?._i,
        workers: workers?.value,
        workersId: workers?.value?.map((worker) => worker.id) || null,
        houseId: house?.value[0].id,
        house: house?.value,
        total: Object.entries(checks).filter(([key, value]) => value.check)
          .length,
        finished: false,
        done: 0,
      };

      console.log('editCheckListForm', editCheckListForm)


      await updateFirebase(docId, editCheckListForm);

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Checklist ✅',
        text2: 'El checklist se actualizó correctamente',
      });
    } catch (err) {
    } finally {
      setLoading(false);
      setVisible(false);
      cleanForm();
      openScreenWithPush(MAIN_ADMIN_STACK_KEY);
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      setVisible(true);
      const newCheckListForm = {
        observations: observations || '',
        date: date?._i,
        workers: workers?.value || null,
        workersId: workers?.value?.map((worker) => worker.id) || null,
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
              locale: value.locale,
              originalId: value.id,
              numberOfPhotos: 0,
              done: false,
              worker: null,
              date: null,
            }),
          ),
      );
    } catch (err) {
      setError(true);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: 'Algo ocurrió al crear el checklist, inténtalo más tarde',
      });
    } finally {
      setLoading(false);
      setVisible(false);
      cleanForm();
      popScreen();
    }
  };

  useEffect(() => {
    !edit && cleanForm();
  }, [edit]);

  return {
    error,
    loading,
    handleAdd,
    handleEdit,
    hasFilledForm,
  };
};
