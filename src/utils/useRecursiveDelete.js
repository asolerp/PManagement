import {useState} from 'react';

import {openScreenWithPush} from '../Router/utils/actions';
import {
  HOME_ADMIN_STACK_KEY,
  MAIN_ADMIN_STACK_KEY,
} from '../Router/utils/routerKeys';
import {firebase} from '@react-native-firebase/firestore';
import {error} from '../lib/logging';

const useRecursiveDelete = ({path, collection, backScreen}) => {
  const [loading, setLoading] = useState(false);
  const recursiveDelete = async () => {
    const deleteFn = firebase.functions().httpsCallable('recursiveDelete');
    try {
      setLoading(true);
      await deleteFn({
        path: path,
        collection: collection,
      });
      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: backScreen || MAIN_ADMIN_STACK_KEY,
      });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    recursiveDelete,
  };
};

export default useRecursiveDelete;
