import {Platform} from 'react-native';

export const parseImages = (imgs) => {
  console.log(
    'images',
    imgs.map((image, i) => ({
      fileName: image.filename || `image-${i}`,
      fileUri: Platform.OS === 'android' ? image.path : image.sourceURL,
      fileType: image.mime,
    })),
  );
  return imgs.map((image, i) => ({
    fileName: image.filename || `image-${i}`,
    fileUri: Platform.OS === 'android' ? image.path : image.sourceURL,
    fileType: image.mime,
  }));
};
