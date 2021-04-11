import {launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {Platform} from 'react-native';

export const launchImage = (setter) => {
  let options = {
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };
  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    } else {
      setter({
        fileName: response.fileName,
        filePath: response,
        fileData: response.data,
        fileUri: response.uri,
        fileType: response.type,
      });
    }
  });
};

export const handleImagePicker = (callback) => {
  ImagePicker.openPicker({
    compressImageMaxWidth: 300,
    compressImageQuality: 0.3,
    multiple: true,
    waitAnimationEnd: false,
    includeExif: false,
    forceJpg: true,
    maxFiles: 10,
    mediaType: 'photo',
    includeBase64: true,
  }).then((imgs) => {
    callback(imgs);
  });
};

/**
 * Get platform specific value from response
 */

export const getFileName = (name, path) => {
  if (name != null) {
    return name;
  }

  if (Platform.OS === 'ios') {
    path = '~' + path.substring(path.indexOf('/Documents'));
  }
  return path.split('/').pop();
};

export const getPlatformPath = ({path, uri}) => {
  return Platform.select({
    android: {value: path},
    ios: {value: uri},
  });
};

export const getPlatformURI = (imagePath) => {
  let imgSource = imagePath;
  if (isNaN(imagePath)) {
    imgSource = {uri: this.state.imagePath};
    if (Platform.OS == 'android') {
      imgSource.uri = 'file:///' + imgSource.uri;
    }
  }
  return imgSource;
};
