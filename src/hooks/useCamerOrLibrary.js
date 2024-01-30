import {useCallback} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export const useCameraOrLibrary = () => {
  const onImagePress = useCallback(({type, options, callback}) => {
    if (type === 'capture') {
      launchCamera(
        options,
        (response) => callback && callback(response?.assets),
      );
    } else {
      launchImageLibrary(
        options,
        (response) => callback && callback(response?.assets),
      );
    }
  }, []);

  return {
    onImagePress,
  };
};
