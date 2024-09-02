import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

export const useGetOwnerHouse = ({ userId }) => {
  const [house, setHouse] = useState({});
  useEffect(() => {
    if (userId) {
      const unsubscribe = firestore()
        .collection('houses')
        .where('owner.id', '==', userId)
        .onSnapshot(snapshot => {
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
