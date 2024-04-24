import {useCallback, useEffect, useState} from 'react';

import firestore from '@react-native-firebase/firestore';

export const useGetHouseById = (userId) => {
  const [house, setHouse] = useState();
  const [checklist, setChecklist] = useState();
  const [checksFromChecklist, setChecksFromChecklist] = useState();
  const [loading, setLoading] = useState();

  const getOwnerDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const ownerHouse = await firestore()
        .collection('houses')
        .where('owner.id', '==', userId)
        .get();

      const houseData = ownerHouse.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];

      const houseQuery = await firestore()
        .collection('houses')
        .doc(houseData.id)
        .get();

      await firestore()
        .collection('checklists')
        .where('houseId', '==', houseData.id)
        .orderBy('date', 'desc')
        .limit(1)
        .get()
        .then(async (response) => {
          const document = response.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))[0];
          setChecklist(document);
          const checksFromChecklistQuery = await firestore()
            .collection('checklists')
            .doc(document.id)
            .collection('checks')
            .get();
          setChecksFromChecklist(
            checksFromChecklistQuery.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
          );
        });
      setHouse({id: houseQuery.id, ...houseQuery.data()});
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    getOwnerDashboardData();
  }, []);

  return {
    house,
    loading,
    checklist,
    checksFromChecklist,
    getOwnerDashboardData,
  };
};
