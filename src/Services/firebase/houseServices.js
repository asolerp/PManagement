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

const fetchHousesPaginated = async ({ pageParam = null, limit = 10 }) => {
  try {
    let query = firestore()
      .collection('houses')
      .orderBy('houseName')
      .limit(limit);

    // Si hay un cursor, continuar desde ahí
    if (pageParam) {
      query = query.startAfter(pageParam);
    }

    const snapshot = await query.get();

    const houses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Obtener el último documento para el siguiente cursor
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      houses: houses || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limit
    };
  } catch (error) {
    console.error('Error fetching paginated houses: ', error);
    // Retornar estructura vacía en caso de error para evitar crashes
    return {
      houses: [],
      nextCursor: null,
      hasMore: false
    };
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

export { fetchHouses, fetchHousesPaginated, fetchHouse, fetchHouseByOwnerId };
