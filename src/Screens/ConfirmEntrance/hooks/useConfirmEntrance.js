import { useContext } from 'react';
import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { useCameraOrLibrary } from '../../../hooks/useCamerOrLibrary';
import { useAddFirebase } from '../../../hooks/useAddFirebase';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import useUploadImageCheck from '../../../hooks/useUploadImage';
import { ENTRANCES } from '../../../utils/firebaseKeys';
import { imageActions } from '../../../utils/imageActions';
import { Timestamp } from '@react-native-firebase/firestore';
import { Logger } from '../../../lib/logging';

import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../Store/User/userSlice';
import { popScreen } from '../../../Router/utils/actions';
import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';

// Ubicación por defecto para modo desarrollo (Madrid, España)
const DEV_DEFAULT_LOCATION = {
  latitude: 40.4168,
  longitude: -3.7038
};

// Precisión máxima aceptable en metros (100m es razonable para GPS móvil)
const MAX_ACCEPTABLE_ACCURACY = 100;
// Número máximo de intentos para obtener una ubicación precisa
const MAX_LOCATION_ATTEMPTS = 3;

// Helper para obtener ubicación con reintentos y validación de precisión
const getLocationWithFallback = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let bestLocation = null;
    let bestAccuracy = Infinity;

    const tryGetLocation = () => {
      attempts++;
      Logger.info('Getting GPS location', { attempt: attempts, maxAttempts: MAX_LOCATION_ATTEMPTS });

      Geolocation.getCurrentPosition(
        info => {
          const { latitude, longitude, accuracy } = info.coords;
          Logger.info('GPS location received', { 
            latitude, 
            longitude, 
            accuracy: accuracy ? `${accuracy.toFixed(1)}m` : 'unknown',
            attempt: attempts 
          });

          // Guardar la mejor ubicación obtenida
          if (accuracy && accuracy < bestAccuracy) {
            bestAccuracy = accuracy;
            bestLocation = { latitude, longitude, accuracy };
          } else if (!bestLocation) {
            bestLocation = { latitude, longitude, accuracy: accuracy || 0 };
          }

          // Si la precisión es buena, usar esta ubicación
          if (!accuracy || accuracy <= MAX_ACCEPTABLE_ACCURACY) {
            resolve({ latitude, longitude });
            return;
          }

          // Si la precisión es mala y aún tenemos intentos, reintentar
          if (attempts < MAX_LOCATION_ATTEMPTS) {
            Logger.warn('GPS accuracy too low, retrying', { 
              accuracy: `${accuracy.toFixed(1)}m`, 
              maxAcceptable: `${MAX_ACCEPTABLE_ACCURACY}m`,
              attempt: attempts 
            });
            // Esperar un poco antes de reintentar para que el GPS se estabilice
            setTimeout(tryGetLocation, 1500);
            return;
          }

          // Agotamos los intentos, usar la mejor ubicación obtenida
          Logger.warn('Max GPS attempts reached, using best location', { 
            bestAccuracy: bestAccuracy ? `${bestAccuracy.toFixed(1)}m` : 'unknown',
            attempts 
          });
          resolve({ 
            latitude: bestLocation.latitude, 
            longitude: bestLocation.longitude 
          });
        },
        error => {
          Logger.warn('GPS error', { 
            code: error.code, 
            message: error.message, 
            attempt: attempts 
          });

          // Si tenemos una ubicación previa, usarla
          if (bestLocation) {
            Logger.warn('Using previously obtained location after error', { 
              bestAccuracy: bestAccuracy ? `${bestAccuracy.toFixed(1)}m` : 'unknown'
            });
            resolve({ 
              latitude: bestLocation.latitude, 
              longitude: bestLocation.longitude 
            });
            return;
          }

          // Reintentar si quedan intentos
          if (attempts < MAX_LOCATION_ATTEMPTS) {
            setTimeout(tryGetLocation, 1500);
            return;
          }

          // En modo desarrollo, usar ubicación por defecto
          if (__DEV__) {
            Logger.warn('Using dev fallback location', {
              reason: error.message,
              fallbackLocation: DEV_DEFAULT_LOCATION
            });
            resolve(DEV_DEFAULT_LOCATION);
          } else {
            reject(error);
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 0  // Forzar ubicación fresca, no usar caché
        }
      );
    };

    tryGetLocation();
  });
};

export const useConfirmEntrance = selectedHouse => {
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
        Logger.warn('Camera permission request error', { error: err.message });
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
        Logger.warn('Location permission error', { error: err.message });
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

      const location = await getLocationWithFallback();

      await updateFirebase(docId, {
        action: 'exit',
        exitDate: Timestamp.fromDate(new Date()),
        exitLocation: location
      });

      await uploadImages(imgs, null, docId, () => {
        setVisible(false);
      });
    } catch (err) {
      Logger.error('Error updating entrance', err, { service: 'confirmEntrance' });

      if (err.message?.includes('location') || err.code === 1 || err.code === 2) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, verifica que los permisos de ubicación estén habilitados.'
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo registrar la salida. Por favor, inténtalo de nuevo.'
        );
      }
      setVisible(false);
    }
  };

  const saveEntrance = async imgs => {
    try {
      setVisible(true);

      const location = await getLocationWithFallback();

      const data = {
        action: 'enter',
        worker: user,
        location,
        date: Timestamp.fromDate(new Date()),
        // Incluir casa seleccionada si existe
        ...(selectedHouse && {
          house: {
            id: selectedHouse.id,
            houseName: selectedHouse.houseName
          }
        })
      };

      const newEntrance = await addFirebase('entrances', data);
      await uploadImages(imgs, null, newEntrance.id, () => {
        setVisible(false);
        popScreen();
      });
    } catch (err) {
      Logger.error('Error saving entrance', err, { service: 'confirmEntrance' });

      if (err.message?.includes('location') || err.code === 1 || err.code === 2) {
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener tu ubicación. Por favor, verifica que los permisos de ubicación estén habilitados.'
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo registrar la entrada. Por favor, inténtalo de nuevo.'
        );
      }
      setVisible(false);
    }
  };

  const onRegisterEnter = async () => {
    // En modo desarrollo, permitir bypass sin cámara
    if (__DEV__) {
      Alert.alert(
        'Modo Desarrollo',
        '¿Quieres usar la cámara o registrar sin foto?',
        [
          {
            text: 'Sin foto (dev)',
            onPress: () => saveEntrance([])
          },
          {
            text: 'Usar cámara',
            onPress: async () => {
              const hasPermissions = await checkAllPermissions();
              if (!hasPermissions) return;

              onImagePress({
                type: 'capture',
                options: { ...imageActions['common'] },
                callback: async imgs => saveEntrance(imgs)
              });
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    // Producción: verificar permisos y usar cámara
    const hasPermissions = await checkAllPermissions();
    if (!hasPermissions) return;

    onImagePress({
      type: 'capture',
      options: { ...imageActions['common'] },
      callback: async imgs => saveEntrance(imgs)
    });
  };

  const onRegisterExit = async docId => {
    // En modo desarrollo, permitir bypass sin cámara
    if (__DEV__) {
      Alert.alert(
        'Modo Desarrollo',
        '¿Quieres usar la cámara o registrar sin foto?',
        [
          {
            text: 'Sin foto (dev)',
            onPress: () => updateEntrance([], docId)
          },
          {
            text: 'Usar cámara',
            onPress: async () => {
              const hasPermissions = await checkAllPermissions();
              if (!hasPermissions) return;

              onImagePress({
                type: 'capture',
                options: { ...imageActions['common'] },
                callback: async imgs => updateEntrance(imgs, docId)
              });
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    // Producción: verificar permisos y usar cámara
    const hasPermissions = await checkAllPermissions();
    if (!hasPermissions) return;

    onImagePress({
      type: 'capture',
      options: { ...imageActions['common'] },
      callback: async imgs => updateEntrance(imgs, docId)
    });
  };

  return {
    onRegisterEnter,
    onRegisterExit
  };
};
