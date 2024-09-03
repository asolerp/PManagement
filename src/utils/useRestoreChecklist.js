import { useContext, useState } from 'react';

import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

const useRestoreChecklist = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const restoreChecklist = async docId => {
    const restoreFn = firebase
      .app()
      .functions(REGION)
      .httpsCallable('restoreDocumentWithSubcollection');
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
