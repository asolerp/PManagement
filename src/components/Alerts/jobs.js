import {Alert} from 'react-native';

export const finishJob = (action) =>
  Alert.alert(
    '🚨 Atención',
    '¿Seguro que quieres cambiar el estado del trabajo?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Aceptar', onPress: () => action()},
    ],
    {cancelable: false},
  );
