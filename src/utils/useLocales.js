import {useState, useEffect} from 'react';
import * as Localization from 'expo-localization';
import { Logger } from '../lib/logging';

export const useLocales = () => {
  const [locale, setLocale] = useState();

  useEffect(() => {
    try {
      const locales = Localization.getLocales();
      if (locales && locales[0]) {
        setLocale(locales[0].languageCode);
      } else {
        setLocale('en');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.warn('Failed to get locale', errorObj);
      setLocale('en');
    }
  }, []);

  return {
    locale: locale || 'en',
  };
};
