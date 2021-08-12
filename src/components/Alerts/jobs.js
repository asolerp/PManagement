import {Alert} from 'react-native';
import i18n from '../../Translations/index';

export const finishJob = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.job.finish'),
    [
      {
        text: i18n.t('alerts.cancel'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: i18n.t('alerts.accept'), onPress: () => action()},
    ],
    {cancelable: false},
  );

export const openJob = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.job.open'),
    [
      {
        text: i18n.t('alerts.cancel'),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: i18n.t('alerts.accept'), onPress: () => action()},
    ],
    {cancelable: false},
  );
