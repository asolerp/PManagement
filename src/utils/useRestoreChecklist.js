import { useContext, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { Logger } from '../lib/logging';
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
      Logger.debug('Restaurando', { docId });
      await restoreFn({
        docId
      }).then(() => setVisible(false));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      Logger.error('Error al restaurar checklist', errorObj, { docId }, { showToast: true });
      setVisible(false);
    }
  };
  return {
    loading,
    restoreChecklist
  };
};

export default useRestoreChecklist;
