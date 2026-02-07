import { useContext, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { Logger } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

const useRecursiveDelete = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const recursiveDelete = async ({ path, collection, docId }) => {
    const app = getApp();
    const functions = getFunctions(app, REGION);
    const deleteFn = httpsCallable(functions, 'recursiveDelete');
    try {
      setLoading(true);
      setVisible(true);
      Logger.debug('Borrando', { path, collection, docId });
      await deleteFn({
        path: path,
        docId,
        collection: collection
      }).then(() => setVisible(false));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      Logger.error('Error al borrar recursivamente', errorObj, { path, collection, docId }, { showToast: true });
      setVisible(false);
    }
  };
  return {
    loading,
    recursiveDelete
  };
};

export default useRecursiveDelete;
