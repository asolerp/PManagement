import {useCallback, useState} from 'react';
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
import {popScreen} from '../../../Router/utils/actions';
import {error as errorLog} from '../../../lib/logging';

export const useAddEditCheckist = ({docId}) => {
  const dispatch = useDispatch({id: docId});

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

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
  const {recursiveDelete} = useRecursiveDelete({
    path: `${CHECKLISTS}/${docId}/checks`,
    collection: CHECKLISTS,
  });

  const handleEdit = async () => {
    try {
      setLoading(true);
      const editCheckListForm = {
        observations: observations,
        date: date?._i || date,
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
              photos: value.photos,
              done: value.done,
              worker: null,
              date: null,
            }),
          ),
      );
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Checklist ✅',
        text2: 'El checklist se actualizó correctamente',
      });
    } catch (err) {
      setError(true);
      errorLog({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
      cleanForm();
      popScreen();
    }
  };

  const handleAdd = async () => {
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
      console.log('new', newCheckListForm);
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
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Checklist ✅',
        text2: 'El checklist se creó correctamente',
      });
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
      cleanForm();
      popScreen();
    }
  };

  return {
    loading,
    error,
    handleEdit,
    handleAdd,
  };
};
