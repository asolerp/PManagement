import { useContext, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { Logger } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

const useMoveToRecycleBien = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const moveToRecycleBin = async docId => {
    const app = getApp();
    const functions = getFunctions(app, REGION);
    const moveFn = httpsCallable(
      functions,
      'moveToRecycleBinWithSubcollection'
    );
    try {
      setLoading(true);
      setVisible(true);
      Logger.debug('Moviendo a la papelera', { docId });
      await moveFn({
        docId
      }).then(() => setVisible(false));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      Logger.error('Error al mover a la papelera', errorObj, { docId }, { showToast: true });
      setVisible(false);
    }
  };
  return {
    loading,
    moveToRecycleBin
  };
};

export default useMoveToRecycleBien;
