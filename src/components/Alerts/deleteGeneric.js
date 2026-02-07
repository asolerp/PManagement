import {Alert} from 'react-native';
import {Logger} from '../../lib/logging';

export const deleteGeneric = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres continuar con el borrado?',
    [
      {
        text: 'Cancelar',
        onPress: () => Logger.breadcrumb('deleteGeneric cancelled'),
        style: 'cancel',
      },
      {text: 'Borrar', onPress: () => action()},
    ],
    {cancelable: false},
  );
