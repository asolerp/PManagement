import firestore from '@react-native-firebase/firestore';

const fetchHouses = async () => {
  try {
    const snapshot = await firestore()
      .collection('houses')
      .orderBy('houseName')
      .get();

    const houses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return houses;
  } catch (error) {
    console.error("Error fetching houses: ", error);
    throw error; // o manejar el error como prefieras
  }
};

export {
    fetchHouses
}