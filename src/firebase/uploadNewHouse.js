//Firebase

import {firebase} from '@react-native-firebase/firestore';

import {error} from '../lib/logging';

const uploadHousePhoto = firebase.functions().httpsCallable('uploadHousePhoto');

export const newHouse = async (data, houseImage, userUID) => {
  try {
    await uploadHousePhoto({
      house: data,
      imageBase64: houseImage,
    });
    // const house = await firestore().collection('houses').add(data);
    // const uploadImage = await cloudinaryUpload(
    //   houseImage,
    //   `/PortManagement/Houses/${house.id}`,
    // );
    // await firestore()
    //   .collection('houses')
    //   .doc(house.id)
    //   .update({houseImage: uploadImage});
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
