import {useState, useEffect} from 'react';
import {NativeModules, Platform} from 'react-native';

export const useLocales = () => {
  const [locale, setLocale] = useState();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setLocale(
        NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0],
      );
    } else {
      setLocale(NativeModules.I18nManager.localeIdentifier);
    }
  }, []);

  return {
    locale: locale?.split('_')[0],
  };
};
