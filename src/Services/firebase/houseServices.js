import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  where,
  startAfter
} from '@react-native-firebase/firestore';

import { Logger } from '../../lib/logging';

const fetchHouses = async () => {
  try {
    const db = getFirestore();
    const housesRef = collection(db, 'houses');
    const q = query(housesRef, orderBy('houseName'));
    const snapshot = await getDocs(q);

    const houses = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return houses;
  } catch (error) {
    Logger.error('Error fetching houses', error, { service: 'houseServices' });
    throw error; // o manejar el error como prefieras
  }
};

const fetchHousesPaginated = async ({
  pageParam = null,
  limit: limitCount = 10
}) => {
  try {
    const db = getFirestore();
    const housesRef = collection(db, 'houses');

    let q = query(housesRef, orderBy('houseName'), limit(limitCount));

    // Si hay un cursor, continuar desde ahí
    if (pageParam) {
      q = query(
        housesRef,
        orderBy('houseName'),
        startAfter(pageParam),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);

    const houses = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Obtener el último documento para el siguiente cursor
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      houses: houses || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    Logger.error('Error fetching paginated houses', error, { service: 'houseServices' });
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
    const db = getFirestore();
    const houseDoc = doc(db, 'houses', houseId);
    const docSnap = await getDoc(houseDoc);

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    Logger.error('Error fetching house', error, { service: 'houseServices' });
    throw error; // o manejar el error como prefieras
  }
};

const fetchHouseByOwnerId = async userId => {
  try {
    const db = getFirestore();
    const housesRef = collection(db, 'houses');
    const q = query(housesRef, where('owner.id', '==', userId));
    const snapshot = await getDocs(q);

    const houses = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return houses[0];
  } catch (error) {
    Logger.error('Error fetching houses', error, { service: 'houseServices' });
    throw error; // o manejar el error como prefieras
  }
};

export { fetchHouses, fetchHousesPaginated, fetchHouse, fetchHouseByOwnerId };
