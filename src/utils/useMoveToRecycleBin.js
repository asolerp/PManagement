import { useContext, useState } from 'react';

import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

const useMoveToRecycleBien = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const moveToRecycleBin = async docId => {
    const moveFn = firebase
      .app()
      .functions(REGION)
      .httpsCallable('moveToRecycleBinWithSubcollection');
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
