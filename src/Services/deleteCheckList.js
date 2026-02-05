import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { error } from '../lib/logging';
import { REGION } from '../firebase/utils';

const deleteCheckList = async path => {
  try {
    const app = getApp();
    const functions = getFunctions(app, REGION);
    const deleteFn = httpsCallable(functions, 'recursiveDelete');
    await deleteFn(path);
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true
    });
    return err;
  }
};

export default deleteCheckList;
