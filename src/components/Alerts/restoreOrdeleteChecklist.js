import {Alert} from 'react-native';
import { Logger } from '../../lib/logging';

export const restoreOrDeleteChecklist = (restore, remove) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Que acción quieres realizar?',
    [
      {
        text: 'Restaurar',
        onPress: () => restore(),
        style: 'cancel',
      },
      {text: 'Borrar', onPress: () => remove() ,style: 'destructive'},
      {
        text: 'Cancelar',
        onPress: () => Logger.breadcrumb('restoreOrDeleteChecklist cancelled'),
        style: 'cancel',
      },
    ],
    {cancelable: false},
  );
