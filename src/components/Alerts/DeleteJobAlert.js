import {Alert} from 'react-native';

const deleteJobAlert = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Seguro que quieres eliminar el trabajo?',
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

const deleteTaskAlert = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Vas a eliminar la tarea?',
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

const finishTaskAlert = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Vas a finalizar la tarea?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Finalizar', onPress: () => action()},
    ],
    {cancelable: false},
  );

const openTaskStatus = (action) =>
  Alert.alert(
    '🚨 Atención 🚨',
    '¿Vas a volver a poner la tarea como no finalizada?',
    [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'No finalizada', onPress: () => action()},
    ],
    {cancelable: false},
  );

export {deleteJobAlert, deleteTaskAlert, finishTaskAlert, openTaskStatus};
