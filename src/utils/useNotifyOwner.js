import { useContext, useState } from 'react';

import { openStackWithReplace } from '../Router/utils/actions';
import {
  HOME_ADMIN_STACK_KEY,
  MAIN_ADMIN_STACK_KEY
} from '../Router/utils/routerKeys';
import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';
import { useQueryClient } from '@tanstack/react-query';

export const useNotifyOwner = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const queryClient = useQueryClient();
  const notifyOwner = async docId => {
    const app = getApp();
    const functions = getFunctions(app, REGION);
    const notifyOwnerFn = httpsCallable(functions, 'notifyOwner');
    try {
      setLoading(true);
      setVisible(true);
      await notifyOwnerFn({
        checkId: docId
      }).then(() => setVisible(false));
      queryClient.invalidateQueries({ queryKey: ['checklistsNotFinished'] });
      queryClient.invalidateQueries({
        queryKey: ['checklistsNotFinishedPaginated']
      });
      queryClient.invalidateQueries({ queryKey: ['checklistsFinished'] });
      queryClient.invalidateQueries({
        queryKey: ['checklistsFinishedPaginated']
      });
      openStackWithReplace(HOME_ADMIN_STACK_KEY, MAIN_ADMIN_STACK_KEY);
    } catch (err) {
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
    notifyOwner
  };
};
