import {Alert} from 'react-native';
import i18n from '../../Translations/index';

export const sendOwnerChecklist = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.checklist.finish'),
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

export const deleteCheckListAlert = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.checklist.remove'),
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
