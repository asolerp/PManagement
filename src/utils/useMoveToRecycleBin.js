import { useContext, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { error } from '../lib/logging';
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
      console.log('Moviendo a la papelera');
      await moveFn({
        docId
      }).then(() => setVisible(false));
    } catch (err) {
      console.log('ERROR', err);
      error({
        message: err.message,
        track: true,
        asToast: true
      });
      setVisible(false);
    }
  };
  return {
    loading,
    moveToRecycleBin
  };
};

export default useMoveToRecycleBien;
