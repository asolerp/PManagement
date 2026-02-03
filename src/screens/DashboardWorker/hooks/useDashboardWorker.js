import { useSelector } from 'react-redux';
import { userSelector } from '../../../Store/User/userSlice';
import firestore from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useConfirmEntrance } from '../../ConfirmEntrance/hooks/useConfirmEntrance';

export const useDashboardWorker = () => {
  const user = useSelector(userSelector);
  const { onRegisterExit } = useConfirmEntrance();
  const [refreshKey, setRefreshKey] = useState(0);

  function getStartOfToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function getEndOfToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);
    return end;
  }

  const query = useMemo(
    () =>
      firestore()
        .collection('entrances')
        .where('worker.id', '==', user?.id)
        .where('action', '==', 'enter')
        .where('date', '>=', getStartOfToday())
        .where('date', '<=', getEndOfToday()),
    [user?.id, refreshKey]
  );

  const [values, loading] = useCollectionData(query, {
    idField: 'id'
  });

  // Función para forzar actualización
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    loading,
    entrance: values?.[0],
    onRegisterExit,
    refresh
  };
};
