import {INCIDENCES} from '../utils/firebaseKeys';
import firestore from '@react-native-firebase/firestore';

export const asignWorkerToIncidence = async (incidenceId, update) => {
  await firestore().collection(INCIDENCES).doc(incidenceId).update(update);
};
