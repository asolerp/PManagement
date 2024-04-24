import firestore from '@react-native-firebase/firestore';
import {error} from '../lib/logging';



export const newHouse = async (data) => {
  try {
   const result = await firestore().collection('houses').add(data);
   console.log("[[RESULT]]", result)
   return result.id
  } catch (err) {
    error({
      message: err.message,
      track: true,
      asToast: true,
    });
  }
};
