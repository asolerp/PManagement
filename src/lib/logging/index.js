/**
 * Professional Logging System with Firebase Crashlytics Integration
 *
 * Usage:
 *   import { Logger } from '../lib/logging';
 *
 *   // Simple logging
 *   Logger.info('User logged in');
 *   Logger.warn('Low memory warning');
 *   Logger.error('Failed to fetch data', error);
 *
 *   // With context
 *   Logger.error('Payment failed', error, { userId: '123', amount: 99.99 });
 *
 *   // User tracking
 *   Logger.setUser({ id: 'user123', email: 'user@example.com', role: 'admin' });
 *
 *   // Breadcrumbs (navigation/action trail)
 *   Logger.breadcrumb('Opened checkout screen');
 *
 *   // Show toast to user
 *   Logger.error('Network error', error, {}, { showToast: true });
 */

import {
  getCrashlytics,
  log as crashLog,
  recordError,
  setUserId,
  setAttributes,
  setAttribute
} from '@react-native-firebase/crashlytics';

import { showToast } from './utils/showToast';

// ============================================
// Constants
// ============================================

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

const LOG_PREFIXES = {
  DEBUG: '🔍 [DEBUG]',
  INFO: 'ℹ️ [INFO]',
  WARN: '⚠️ [WARN]',
  ERROR: '❌ [ERROR]',
  FATAL: '💀 [FATAL]'
};

// Minimum level to log (in production, skip DEBUG)
const MIN_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

// ============================================
// Crashlytics Instance
// ============================================

let crashlyticsInstance = null;

const getCrashlyticsInstance = () => {
  if (!crashlyticsInstance) {
    try {
      crashlyticsInstance = getCrashlytics();
    } catch (e) {
      // Crashlytics not available (e.g., in Expo Go)
      if (__DEV__) {
        console.warn('[Logger] Crashlytics not available:', e.message);
      }
    }
  }
  return crashlyticsInstance;
};

// ============================================
// Internal Helpers
// ============================================

const formatMessage = (level, message, context) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `${timestamp} ${LOG_PREFIXES[level]} ${message}${contextStr}`;
};

const shouldLog = level => LOG_LEVELS[level] >= MIN_LOG_LEVEL;

const logToConsole = (level, message, context, error) => {
  if (!__DEV__) return;

  const formattedMsg = formatMessage(level, message, context);

  switch (level) {
    case 'ERROR':
    case 'FATAL':
      console.error(formattedMsg, error || '');
      break;
    case 'WARN':
      console.warn(formattedMsg);
      break;
    default:
      console.log(formattedMsg);
  }
};

const logToCrashlytics = (level, message, context) => {
  const crashlytics = getCrashlyticsInstance();
  if (!crashlytics) return;

  try {
    // Add log entry
    crashLog(crashlytics, `[${level}] ${message}`);

    // Add context as attributes if provided
    if (context && typeof context === 'object') {
      Object.entries(context).forEach(([key, value]) => {
        setAttribute(crashlytics, key, String(value));
      });
    }
  } catch (e) {
    if (__DEV__) {
      console.warn('[Logger] Failed to log to Crashlytics:', e.message);
    }
  }
};

const recordErrorToCrashlytics = (error, context) => {
  const crashlytics = getCrashlyticsInstance();
  if (!crashlytics) return;

  try {
    // Ensure error is an Error object
    const errorObj =
      error instanceof Error ? error : new Error(String(error));

    // Add context as attributes
    if (context && typeof context === 'object') {
      Object.entries(context).forEach(([key, value]) => {
        setAttribute(crashlytics, key, String(value));
      });
    }

    // Record the error
    recordError(crashlytics, errorObj);
  } catch (e) {
    if (__DEV__) {
      console.warn('[Logger] Failed to record error:', e.message);
    }
  }
};

// ============================================
// Logger API
// ============================================

export const Logger = {
  /**
   * Debug level logging - only in development
   */
  debug: (message, context = null) => {
    if (!shouldLog('DEBUG')) return;
    logToConsole('DEBUG', message, context);
    // Debug logs are not sent to Crashlytics
  },

  /**
   * Info level logging
   */
  info: (message, context = null, options = {}) => {
    if (!shouldLog('INFO')) return;
    logToConsole('INFO', message, context);
    logToCrashlytics('INFO', message, context);

    if (options.showToast) {
      showToast({ message, type: 'info' });
    }
  },

  /**
   * Warning level logging
   */
  warn: (message, context = null, options = {}) => {
    if (!shouldLog('WARN')) return;
    logToConsole('WARN', message, context);
    logToCrashlytics('WARN', message, context);

    if (options.showToast) {
      showToast({ message, type: 'warning' });
    }
  },

  /**
   * Error level logging - records to Crashlytics
   */
  error: (message, error = null, context = null, options = {}) => {
    if (!shouldLog('ERROR')) return;
    logToConsole('ERROR', message, context, error);
    logToCrashlytics('ERROR', message, context);

    if (error) {
      recordErrorToCrashlytics(error, {
        ...context,
        error_message: message
      });
    }

    if (options.showToast) {
      showToast({
        message: options.toastMessage || message,
        type: 'error'
      });
    }
  },

  /**
   * Fatal error - for critical failures
   */
  fatal: (message, error = null, context = null) => {
    logToConsole('FATAL', message, context, error);
    logToCrashlytics('FATAL', message, context);

    if (error) {
      recordErrorToCrashlytics(error, {
        ...context,
        error_message: message,
        severity: 'fatal'
      });
    }
  },

  /**
   * Add breadcrumb (action trail for debugging)
   */
  breadcrumb: (action, data = null) => {
    const crashlytics = getCrashlyticsInstance();
    if (!crashlytics) return;

    try {
      const breadcrumb = data
        ? `[Breadcrumb] ${action}: ${JSON.stringify(data)}`
        : `[Breadcrumb] ${action}`;
      crashLog(crashlytics, breadcrumb);
    } catch (e) {
      if (__DEV__) {
        console.warn('[Logger] Failed to add breadcrumb:', e.message);
      }
    }
  },

  /**
   * Set user context for crash reports
   */
  setUser: user => {
    const crashlytics = getCrashlyticsInstance();
    if (!crashlytics) return;

    try {
      if (user?.id) {
        setUserId(crashlytics, user.id);
      }

      const userAttributes = {};
      if (user?.email) userAttributes.user_email = user.email;
      if (user?.role) userAttributes.user_role = user.role;
      if (user?.firstName)
        userAttributes.user_name = `${user.firstName} ${user.lastName || ''}`.trim();

      if (Object.keys(userAttributes).length > 0) {
        setAttributes(crashlytics, userAttributes);
      }

      if (__DEV__) {
        console.log('[Logger] User context set:', user?.id);
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[Logger] Failed to set user:', e.message);
      }
    }
  },

  /**
   * Clear user context (on logout)
   */
  clearUser: () => {
    const crashlytics = getCrashlyticsInstance();
    if (!crashlytics) return;

    try {
      setUserId(crashlytics, '');
      setAttributes(crashlytics, {
        user_email: '',
        user_role: '',
        user_name: ''
      });

      if (__DEV__) {
        console.log('[Logger] User context cleared');
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[Logger] Failed to clear user:', e.message);
      }
    }
  },

  /**
   * Set custom attribute for crash context
   */
  setAttribute: (key, value) => {
    const crashlytics = getCrashlyticsInstance();
    if (!crashlytics) return;

    try {
      setAttribute(crashlytics, key, String(value));
    } catch (e) {
      if (__DEV__) {
        console.warn('[Logger] Failed to set attribute:', e.message);
      }
    }
  },

  /**
   * Track screen view
   */
  screenView: screenName => {
    Logger.breadcrumb(`Screen: ${screenName}`);
  }
};

// ============================================
// Legacy exports for backward compatibility
// ============================================

export const info = ({ message, asToast, additionalData = '' }) => {
  Logger.info(message, additionalData ? { data: additionalData } : null, {
    showToast: asToast
  });
};

export const error = ({ message, asToast, track, data }) => {
  const errorObj = data instanceof Error ? data : null;
  const context = data && !(data instanceof Error) ? data : null;

  Logger.error(message, errorObj, context, { showToast: asToast });
};

export const success = ({ message, asToast }) => {
  if (asToast) {
    showToast({ message, type: 'success' });
  }
  Logger.info(message);
};

export const warn = ({ message, asToast }) => {
  Logger.warn(message, null, { showToast: asToast });
};

export const trace = message => {
  Logger.debug(message);
};

export const setUser = user => {
  Logger.setUser(user);
};

export const clearUser = () => {
  Logger.clearUser();
};

// Re-export utilities
export { showToast } from './utils/showToast';
export { TOAST_DURATION, LOG_TYPES } from './constants';
