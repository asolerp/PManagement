import firestore from '@react-native-firebase/firestore';
import { INCIDENCES } from "../../utils/firebaseKeys";

const fetchIncidences = async (params) => {

    const queryKey = params?.queryKey;
  
    const uid = queryKey[1];
    const finished = queryKey[2];
  
    try {
  
      let snapshot;
  
      if (uid) {
          snapshot = await firestore()
          .collection(INCIDENCES)
          .where('done', '==', finished)
          .where('workersId', 'array-contains', uid)
          .get();
      } else {
          snapshot = await firestore().collection(INCIDENCES).where('done', '==', finished).get();
      }
  
  
      const incidences = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return incidences;
    } catch (error) {
      console.error("Error fetching incidences: ", error);
      throw error; // o manejar el error como prefieras
    }
  };
  
  export {
    fetchIncidences
  }