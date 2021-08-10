import {useState} from 'react';

import Toast from 'react-native-toast-message';

import {openScreenWithPush} from '../Router/utils/actions';
import {
  HOME_ADMIN_STACK_KEY,
  MAIN_ADMIN_STACK_KEY,
} from '../Router/utils/routerKeys';
import {firebase} from '@react-native-firebase/firestore';

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
    } catch (error) {
      console.log(error);
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Error',
        text2: 'Inténtalo más tarde! 🙏',
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
