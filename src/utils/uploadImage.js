import storage from '@react-native-firebase/storage';
import compressImage from './compressImage';

const uploadImage = async (originalUri, storageRef, withCompression = true) => {

    let uri;
    const reference = storage().ref(storageRef);

    if (withCompression) {

    uri = await compressImage(originalUri, 800, 600, 'JPEG', 100);
  
    if (!uri) {
      console.log('Image compression failed.');
      return;
    }

    } else {
      uri = originalUri;
    }
  
    try {
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      return url
    } catch (e) {
      console.log('Upload failed with error:', e);
    }
  };

  export default uploadImage;