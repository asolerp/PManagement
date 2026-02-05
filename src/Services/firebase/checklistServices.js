import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  startAfter
} from '@react-native-firebase/firestore';

const fetchChecklistsNotFinished = async params => {
  const queryKey = params?.queryKey;

  const uid = queryKey[1];
  const house = queryKey[2];
  const limitCount = queryKey[3] || 10;
  const filterHouses = queryKey[4];

  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');
    let q;

    if (house?.id) {
      q = query(
        checklistsRef,
        where('finished', '==', false),
        where('houseId', '==', house?.id),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else if (uid) {
      q = query(
        checklistsRef,
        where('finished', '==', false),
        where('workersId', 'array-contains', uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else if (filterHouses?.length) {
      q = query(
        checklistsRef,
        where('finished', '==', false),
        where('houseId', 'in', filterHouses),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        checklistsRef,
        where('finished', '==', false),
        orderBy('date', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    const checklists = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return checklists;
  } catch (error) {
    console.error('Error fetching checklists: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchChecklistsFinished = async params => {
  const queryKey = params?.queryKey;

  const uid = queryKey[1];
  const limitCount = queryKey[2];
  const filterHouses = queryKey[3];

  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');
    let q;

    if (uid) {
      q = query(
        checklistsRef,
        where('finished', '==', true),
        where('workersId', 'array-contains', uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else if (filterHouses?.length) {
      q = query(
        checklistsRef,
        where('finished', '==', true),
        where('houseId', 'in', filterHouses),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        checklistsRef,
        where('finished', '==', true),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);

    const checklists = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return checklists;
  } catch (error) {
    console.error('Error fetching checklists: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchChecklistsByHouseId = async houseId => {
  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');
    const q = query(
      checklistsRef,
      where('houseId', '==', houseId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);

    const checklists = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return checklists[0];
  } catch (error) {
    console.error('Error fetching checklists: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchChecksByChecklistId = async checklistId => {
  try {
    const db = getFirestore();
    const checksRef = collection(
      doc(collection(db, 'checklists'), checklistId),
      'checks'
    );
    const snapshot = await getDocs(checksRef);

    const checks = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return checks;
  } catch (error) {
    console.error('Error fetching checks: ', error);
    throw error; // o manejar el error como prefieras
  }
};

// Función paginada para checklists not finished
const fetchChecklistsNotFinishedPaginated = async ({
  pageParam = null,
  queryKey
}) => {
  const uid = queryKey[1];
  const house = queryKey[2];
  const limitCount = queryKey[3] || 10;
  const houses = queryKey[4];

  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');

    let queryConstraints = [where('finished', '==', false)];

    // Aplicar filtros según los parámetros
    if (house?.id) {
      queryConstraints.push(where('houseId', '==', house.id));
    } else if (uid && uid !== false) {
      queryConstraints.push(where('workersId', 'array-contains', uid));
    } else if (houses?.length) {
      queryConstraints.push(where('houseId', 'in', houses));
    }

    // Ordenar y aplicar límite
    queryConstraints.push(orderBy('date', 'desc'));
    queryConstraints.push(limit(limitCount));

    // Si hay cursor, continuar desde ahí
    if (pageParam) {
      queryConstraints.push(startAfter(pageParam));
    }

    const q = query(checklistsRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const checklists = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      checklists: checklists || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error fetching paginated not finished checklists: ', error);
    return {
      checklists: [],
      nextCursor: null,
      hasMore: false
    };
  }
};

// Función paginada para checklists finished
const fetchChecklistsFinishedPaginated = async ({
  pageParam = null,
  queryKey
}) => {
  const uid = queryKey[1];
  const limitCount = queryKey[2];
  const houses = queryKey[3];

  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');

    let queryConstraints = [where('finished', '==', true)];

    // Aplicar filtros según los parámetros
    if (uid && uid !== false) {
      queryConstraints.push(where('workersId', 'array-contains', uid));
    } else if (houses?.length) {
      queryConstraints.push(where('houseId', 'in', houses));
    }

    // Ordenar y aplicar límite
    queryConstraints.push(orderBy('date', 'desc'));
    queryConstraints.push(limit(limitCount));

    // Si hay cursor, continuar desde ahí
    if (pageParam) {
      queryConstraints.push(startAfter(pageParam));
    }

    const q = query(checklistsRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const checklists = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      checklists: checklists || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error fetching paginated finished checklists: ', error);
    return {
      checklists: [],
      nextCursor: null,
      hasMore: false
    };
  }
};

export {
  fetchChecklistsByHouseId,
  fetchChecklistsFinished,
  fetchChecksByChecklistId,
  fetchChecklistsNotFinished,
  fetchChecklistsNotFinishedPaginated,
  fetchChecklistsFinishedPaginated
};
