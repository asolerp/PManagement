import {useContext, useState} from 'react';

import {firebase} from '@react-native-firebase/firestore';
import {error} from '../lib/logging';
import {LoadingModalContext} from '../context/loadinModalContext';

const useRecursiveDelete = () => {
  const [loading, setLoading] = useState(false);
  const {setVisible} = useContext(LoadingModalContext);
  const recursiveDelete = async ({path, collection, docId}) => {
    const deleteFn = firebase.functions().httpsCallable('recursiveDelete');
    try {
      setLoading(true);
      setVisible(true);
      console.log('Borrando');
      await deleteFn({
        path: path,
        docId,
        collection: collection,
      }).then(() => setVisible(false));
    } catch (err) {
      console.log('ERROR', err);
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
      setVisible(false);
    }
  };
  return {
    loading,
    recursiveDelete,
  };
};

export default useRecursiveDelete;
