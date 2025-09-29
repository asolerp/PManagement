import firestore from '@react-native-firebase/firestore';

const fetchChecklistsNotFinished = async params => {
  const queryKey = params?.queryKey;

  const uid = queryKey[1];
  const house = queryKey[2];
  const limit = queryKey[3] || 10;
  const filterHouses = queryKey[4];

  try {
    let snapshot;

    if (house?.id) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('houseId', '==', house?.id)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    } else if (uid) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('workersId', 'array-contains', uid)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    } else if (filterHouses?.length) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('houseId', 'in', filterHouses)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    } else {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .orderBy('date', 'desc')
        .get();
    }

    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
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
  const limit = queryKey[2];
  const filterHouses = queryKey[3];

  try {
    let snapshot;

    if (uid) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', true)
        .where('workersId', 'array-contains', uid)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    } else if (filterHouses?.length) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', true)
        .where('houseId', 'in', filterHouses)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    } else {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', true)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
    }

    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return checklists;
  } catch (error) {
    console.error('Error fetching checklists: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchChecklistsByHouseId = async houseId => {
  try {
    const snapshot = await firestore()
      .collection('checklists')
      .where('houseId', '==', houseId)
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return checklists[0];
  } catch (error) {
    console.error('Error fetching checklists: ', error);
    throw error; // o manejar el error como prefieras
  }
};

const fetchChecksByChecklistId = async checklistId => {
  try {
    const snapshot = await firestore()
      .collection('checklists')
      .doc(checklistId)
      .collection('checks')
      .get();

    const checks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
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
  const limit = queryKey[3] || 10;
  const houses = queryKey[4];

  try {
    let query = firestore()
      .collection('checklists')
      .where('finished', '==', false);

    // Aplicar filtros según los parámetros
    if (house?.id) {
      query = query.where('houseId', '==', house.id);
    } else if (uid && uid !== false) {
      query = query.where('workersId', 'array-contains', uid);
    } else if (houses?.length) {
      query = query.where('houseId', 'in', houses);
    }

    // Ordenar y aplicar límite
    query = query.orderBy('date', 'desc').limit(limit);

    // Si hay cursor, continuar desde ahí
    if (pageParam) {
      query = query.startAfter(pageParam);
    }

    const snapshot = await query.get();
    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      checklists: checklists || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limit
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
  const limit = queryKey[2];
  const houses = queryKey[3];

  try {
    let query = firestore()
      .collection('checklists')
      .where('finished', '==', true);

    // Aplicar filtros según los parámetros
    if (uid && uid !== false) {
      query = query.where('workersId', 'array-contains', uid);
    } else if (houses?.length) {
      query = query.where('houseId', 'in', houses);
    }

    // Ordenar y aplicar límite
    query = query.orderBy('date', 'desc').limit(limit);

    // Si hay cursor, continuar desde ahí
    if (pageParam) {
      query = query.startAfter(pageParam);
    }

    const snapshot = await query.get();
    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      checklists: checklists || [],
      nextCursor: lastDoc || null,
      hasMore: snapshot.docs.length === limit
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
