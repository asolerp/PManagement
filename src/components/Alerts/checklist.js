import {Alert} from 'react-native';

export const sendOwnerChecklist = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres finalizar y enviar el informe al propietario?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Duplicar', onPress: () => action()},
    ],
    {cancelable: false},
  );

export const deleteCheckListAlert = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres eliminar este checklist?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Eliminar', onPress: () => action()},
    ],
    {cancelable: false},
  );
