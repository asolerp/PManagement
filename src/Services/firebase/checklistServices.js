import firestore from '@react-native-firebase/firestore';

const fetchChecklistsNotFinished = async params => {
  const queryKey = params?.queryKey;

  const uid = queryKey[1];
  const house = queryKey[2];
  const limit = queryKey[3];
  const filterHouses = queryKey[4];

  try {
    let snapshot;

    if (house?.id) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('houseId', '==', house?.id)
        .limit(limit)
        .get();
    } else if (uid) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('workersId', 'array-contains', uid)
        .limit(limit)
        .get();
    } else if (filterHouses?.length) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
        .where('houseId', 'in', filterHouses)
        .limit(limit)
        .get();
    } else {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', false)
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
        .limit(limit)
        .get();
    } else if (filterHouses?.length) {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', true)
        .where('houseId', 'in', filterHouses)
        .limit(limit)
        .get();
    } else {
      snapshot = await firestore()
        .collection('checklists')
        .where('finished', '==', true)
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

export {
  fetchChecklistsByHouseId,
  fetchChecklistsFinished,
  fetchChecksByChecklistId,
  fetchChecklistsNotFinished
};
