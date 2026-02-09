import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot
} from '@react-native-firebase/firestore';

export const useGetOwnerHouse = ({ userId }) => {
  const [house, setHouse] = useState({});
  useEffect(() => {
    if (userId) {
      const db = getFirestore();
      const housesQuery = query(
        collection(db, 'houses'),
        where('owner.id', '==', userId)
      );

      const unsubscribe = onSnapshot(housesQuery, snapshot => {
        const houseData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHouse(houseData[0]);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  return {
    house
  };
};
