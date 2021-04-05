import {Alert} from 'react-native';

export const finishIncidence = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres resolver la incidencia?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Resolver', onPress: () => action()},
    ],
    {cancelable: false},
  );

export const openIncidence = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres volver a abrir la incidencia?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Abrir', onPress: () => action()},
    ],
    {cancelable: false},
  );
