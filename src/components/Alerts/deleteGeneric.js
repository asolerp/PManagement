import {Alert} from 'react-native';

export const deleteGeneric = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres continuar con el borrado? No se podrá recuperar',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Borrar', onPress: () => action()},
    ],
    {cancelable: false},
  );
