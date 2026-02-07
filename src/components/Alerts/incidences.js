import {Alert} from 'react-native';
import i18n from '../../Translations/index';
import {Logger} from '../../lib/logging';

export const finishIncidence = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.incidence.resolve'),
    [
      {
        text: i18n.t('alerts.cancel'),
        onPress: () => Logger.breadcrumb('finishIncidence cancelled'),
        style: 'cancel',
      },
      {text: i18n.t('alerts.accept'), onPress: () => action()},
    ],
    {cancelable: false},
  );

export const deleteIncidenceAlert = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.incidence.remove'),
    [
      {
        text: i18n.t('alerts.cancel'),
        onPress: () => Logger.breadcrumb('deleteIncidenceAlert cancelled'),
        style: 'cancel',
      },
      {text: i18n.t('alerts.accept'), onPress: () => action()},
    ],
    {cancelable: false},
  );

export const openIncidence = (action) =>
  Alert.alert(
    `🚨 ${i18n.t('alerts.attention')} 🚨`,
    i18n.t('alerts.incidence.open'),
    [
      {
        text: i18n.t('alerts.cancel'),
        onPress: () => Logger.breadcrumb('openIncidence cancelled'),
        style: 'cancel',
      },
      {text: i18n.t('alerts.accept'), onPress: () => action()},
    ],
    {cancelable: false},
  );
