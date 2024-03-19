import {Alert} from 'react-native';

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
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ],
    {cancelable: false},
  );
