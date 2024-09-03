import { useContext, useState } from 'react';

import { openStackWithReplace } from '../Router/utils/actions';
import {
  HOME_ADMIN_STACK_KEY,
  MAIN_ADMIN_STACK_KEY
} from '../Router/utils/routerKeys';
import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { LoadingModalContext } from '../context/loadinModalContext';
import { REGION } from '../firebase/utils';

export const useNotifyOwner = () => {
  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const notifyOwner = async docId => {
    const notifyOwnerFn = firebase
      .app()
      .functions(REGION)
      .httpsCallable('notifyOwner');
    try {
      setLoading(true);
      setVisible(true);
      await notifyOwnerFn({
        checkId: docId
      }).then(() => setVisible(false));
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
