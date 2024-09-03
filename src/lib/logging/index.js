import { isDevelopment } from '../../utils/isDevelopment';

import { LOG_TYPES, TOAST_DURATION } from './constants';

import { showToast } from './utils/showToast';

export { showToast, TOAST_DURATION, LOG_TYPES };

export const info = ({ message, asToast, additionalData = '', onPress }) => {
  if (isDevelopment()) {
    console.log(LOG_TYPES.info, message, additionalData);
  }

  if (asToast) {
    showToast({
      message,
      type: 'info',
      onPress: onPress
    });
  }
};

export const error = ({ message, asToast, track, data }) => {
  if (isDevelopment()) {
    console.warn(LOG_TYPES.error, message);
  }

  if (asToast) {
    showToast({
      message,
      type: 'error'
    });
  }
};

export const success = ({ message, asToast }) => {
  if (isDevelopment()) {
    console.log(LOG_TYPES.success, message);
  }

  if (asToast) {
    showToast({
      message,
      type: 'success'
    });
  }
};

export const warn = ({ message, asToast }) => {
  if (isDevelopment()) {
    console.log(LOG_TYPES.warn, message);
  }

  if (asToast) {
    showToast({
      message,
      type: 'warning'
    });
  }
};

export const trace = message => {
  console.trace(LOG_TYPES.trace, message);
};

export const setUser = () => {};
export const clearUser = () => {};
