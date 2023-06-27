import ImageResizer from '@bam.tech/react-native-image-resizer';

const compressImage = async (uri, width, height, format, quality) => {
  try {
    let result = await ImageResizer.createResizedImage(
      uri,
      width,
      height,
      format,
      quality,
      0,
      undefined,
      false,
      {
        mode: 'contain',
        onlyScaleDown: false,
      }
    );

    return result.uri
  } catch (error) {
    Alert.alert('Unable to resize the photo');
  }
};

export default compressImage;