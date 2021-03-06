//Firebase
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import {cloudinaryUpload} from '../cloudinary/index';
import {error} from '../lib/logging';

export const uploadHouseImage = async (houseUID, imageName, uploadUri) => {
  try {
    await storage().ref(`/${houseUID}/${imageName}`).putFile(uploadUri);
    const url = await storage()
      .ref(`/${houseUID}/${imageName}`)
      .getDownloadURL();
    return url;
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};

export const newHouse = async (data, houseImage, userUID) => {
  try {
    const house = await firestore().collection('houses').add(data);
    const uploadImage = await cloudinaryUpload(
      houseImage,
      `/PortManagement/Houses/${house.id}`,
    );
    await firestore()
      .collection('houses')
      .doc(house.id)
      .update({houseImage: uploadImage});
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
