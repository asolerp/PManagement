import {launchImageLibrary} from 'react-native-image-picker';

export const launchImage = (setter) => {
  let options = {
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };
  launchImageLibrary(options, (response) => {
    console.log('Response = ', response);
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    } else {
      console.log('response', JSON.stringify(response));
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
