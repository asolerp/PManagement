//Firebase
import firestore from '@react-native-firebase/firestore';

import {error} from '../lib/logging';
import uploadImage from '../utils/uploadImage';

export const newHouse = async (data, houseImage, userUID) => {
  try {
    const house = await firestore().collection('houses').add(data);
    const downloadURL = await uploadImage(houseImage, `/PortManagement/Houses/${userUID}`);
    await firestore()
      .collection('houses')
      .doc(house.id)
      .update({...data, houseImage: {
        original: downloadURL,
        small: downloadURL,
      }});
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
