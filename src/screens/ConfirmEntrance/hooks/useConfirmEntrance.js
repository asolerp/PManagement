import { useContext } from 'react';
import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { useCameraOrLibrary } from '../../../hooks/useCamerOrLibrary';
import { useAddFirebase } from '../../../hooks/useAddFirebase';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import useUploadImageCheck from '../../../hooks/useUploadImage';
import { ENTRANCES } from '../../../utils/firebaseKeys';
import { imageActions } from '../../../utils/imageActions';
import { firebase } from '@react-native-firebase/firestore';

import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../Store/User/userSlice';
import { popScreen } from '../../../Router/utils/actions';
import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';

export const useConfirmEntrance = () => {
  const { onImagePress } = useCameraOrLibrary();
  const user = useSelector(userSelector);

  const { updateFirebase } = useUpdateFirebase('entrances');
  const { addFirebase } = useAddFirebase();
  const { setVisible } = useContext(LoadingModalContext);
  const { uploadImages } = useUploadImageCheck(ENTRANCES);

  // Verificar y solicitar permisos de cámara
  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de cámara',
            message:
              'La aplicación necesita acceso a la cámara para registrar entradas',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // En iOS, react-native-image-picker maneja los permisos automáticamente
    return true;
  };

  // Verificar y solicitar permisos de ubicación
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message:
              'La aplicación necesita acceso a tu ubicación para registrar entradas',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // En iOS, Geolocation maneja los permisos automáticamente
    return true;
  };

  // Verificar todos los permisos necesarios
  const checkAllPermissions = async () => {
    const cameraPermission = await checkCameraPermission();
    if (!cameraPermission) {
      Alert.alert(
        'Permiso de cámara requerido',
        'Necesitas conceder permiso de cámara para registrar entradas. Por favor, ve a Configuración y habilita el permiso de cámara.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir configuración',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false;
    }

    const locationPermission = await checkLocationPermission();
    if (!locationPermission) {
      Alert.alert(
        'Permiso de ubicación requerido',
        'Necesitas conceder permiso de ubicación para registrar entradas. Por favor, ve a Configuración y habilita el permiso de ubicación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir configuración',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false;
    }

    return true;
  };

  const updateEntrance = async (imgs, docId) => {
    try {
      setVisible(true);
      Geolocation.getCurrentPosition(
        async info => {
          try {
            await updateFirebase(docId, {
              action: 'exit',
              exitDate: firebase.firestore.Timestamp.fromDate(new Date()),
              exitLocation: {
                latitude: info.coords.latitude,
                longitude: info.coords.longitude
              }
            });

            await uploadImages(imgs, null, docId, () => {
              setVisible(false);
            });
          } catch (err) {
            console.log('Error updating entrance:', err);
            Alert.alert(
              'Error',
              'No se pudo registrar la salida. Por favor, inténtalo de nuevo.'
            );
            setVisible(false);
          }
        },
        error => {
          console.log('Location error:', error);
          Alert.alert(
            'Error de ubicación',
            'No se pudo obtener tu ubicación. Por favor, verifica que los permisos de ubicación estén habilitados.'
          );
          setVisible(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.log('Error in updateEntrance:', err);
      Alert.alert(
        'Error',
        'No se pudo registrar la salida. Por favor, inténtalo de nuevo.'
      );
      setVisible(false);
    }
  };

  const saveEntrance = async imgs => {
    try {
      setVisible(true);
      Geolocation.getCurrentPosition(
        async info => {
          try {
            const data = {
              action: 'enter',
              worker: user,
              location: {
                latitude: info.coords.latitude,
                longitude: info.coords.longitude
              },
              date: firebase.firestore.Timestamp.fromDate(new Date())
            };

            const newEntrance = await addFirebase('entrances', data);
            await uploadImages(imgs, null, newEntrance.id, () => {
              setVisible(false);
              popScreen();
            });
          } catch (err) {
            console.log('Error saving entrance:', err);
            Alert.alert(
              'Error',
              'No se pudo registrar la entrada. Por favor, inténtalo de nuevo.'
            );
            setVisible(false);
          }
        },
        error => {
          console.log('Location error:', error);
          Alert.alert(
            'Error de ubicación',
            'No se pudo obtener tu ubicación. Por favor, verifica que los permisos de ubicación estén habilitados.'
          );
          setVisible(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.log('Error in saveEntrance:', err);
      Alert.alert(
        'Error',
        'No se pudo registrar la entrada. Por favor, inténtalo de nuevo.'
      );
      setVisible(false);
    }
  };

  const onRegisterEnter = async () => {
    // Verificar permisos ANTES de abrir la cámara
    const hasPermissions = await checkAllPermissions();
    if (!hasPermissions) {
      return; // Detener el proceso si no hay permisos
    }

    // Si los permisos están concedidos, proceder con la cámara
    onImagePress({
      type: 'capture',
      options: { ...imageActions['common'] },
      callback: async imgs => {
        saveEntrance(imgs);
      }
    });
  };

  const onRegisterExit = async docId => {
    // Verificar permisos ANTES de abrir la cámara
    const hasPermissions = await checkAllPermissions();
    if (!hasPermissions) {
      return; // Detener el proceso si no hay permisos
    }

    // Si los permisos están concedidos, proceder con la cámara
    onImagePress({
      type: 'capture',
      options: { ...imageActions['common'] },
      callback: async imgs => {
        updateEntrance(imgs, docId);
      }
    });
  };

  return {
    onRegisterEnter,
    onRegisterExit
  };
};
