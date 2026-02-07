import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc
} from '@react-native-firebase/firestore';

import { Logger } from '../../lib/logging';

const fetchUsers = async () => {
  try {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    const snapshot = await getDocs(q);

    const users = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    return users;
  } catch (error) {
    Logger.error('Error fetching users', error, { service: 'userServices' });
    throw error; // o manejar el error como prefieras
  }
};

const fetchUser = async userId => {
  try {
    const db = getFirestore();
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    Logger.error('Error fetching user', error, { service: 'userServices' });
    throw error; // o manejar el error como prefieras
  }
};

export { fetchUsers, fetchUser };
