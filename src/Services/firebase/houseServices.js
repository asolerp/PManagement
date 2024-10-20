import firestore from '@react-native-firebase/firestore';

const fetchHouses = async () => {
  try {
    const snapshot = await firestore()
      .collection('houses')
      .orderBy('houseName')
      .get();

    const houses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return houses;
  } catch (error) {
    console.error('Error fetching houses: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchHouse = async houseId => {
  try {
    const doc = await firestore().collection('houses').doc(houseId).get();

    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error fetching house: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchHouseByOwnerId = async userId => {
  try {
    const snapshot = await firestore()
      .collection('houses')
      .where('owner.id', '==', userId)
      .get();

    const houses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return houses[0];
  } catch (error) {
    console.error('Error fetching houses: ', error);
    throw error; // o manejar el error como prefieras
  }
};

export { fetchHouses, fetchHouse, fetchHouseByOwnerId };
