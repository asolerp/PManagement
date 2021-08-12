import Toast from 'react-native-toast-message';

import {TOAST_DURATION, TOAST_OFFSET} from '../constants';

export const showToast = ({message, type = 'info'}) => {
  Toast.show({
    type,
    text1: message,
    position: 'bottom',
    bottomOffset: TOAST_OFFSET.BOTTOM,
    visibilityTime: TOAST_DURATION.LONG,
  });
};
