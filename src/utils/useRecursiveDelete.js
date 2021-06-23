import {useState} from 'react';

import Toast from 'react-native-toast-message';

import {openScreenWithPush} from '../Router/utils/actions';
import {HOME_ADMIN_STACK_KEY} from '../Router/utils/routerKeys';
import {firebase} from '@react-native-firebase/firestore';

const useRecursiveDelete = ({collection, docId, backScreen}) => {
  const [loading, setLoading] = useState(false);
  const recursiveDelete = async () => {
    console.log(collection, docId, backScreen);
    const deleteFn = firebase.functions().httpsCallable('recursiveDelete');
    try {
      setLoading(true);
      await deleteFn({
        path: `${collection}/${docId}`,
        collection: collection,
      });
      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: backScreen,
      });
    } catch (error) {
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
