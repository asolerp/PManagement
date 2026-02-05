import { useContext, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

const useRestoreChecklist = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const restoreChecklist = async docId => {
    const app = getApp();
    const functions = getFunctions(app, REGION);
    const restoreFn = httpsCallable(
      functions,
      'restoreDocumentWithSubcollection'
    );
    try {
      setLoading(true);
      setVisible(true);
      console.log('Restaurando');
      await restoreFn({
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
    restoreChecklist
  };
};

export default useRestoreChecklist;
