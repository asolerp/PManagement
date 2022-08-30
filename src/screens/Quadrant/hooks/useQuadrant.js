import {useEffect, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {HOUSES} from '../../../utils/entities';
import firestore from '@react-native-firebase/firestore';
import {groupBy} from '../../../utils/arrayManipulations';

export const useQuadrant = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobs, setJobs] = useState(undefined);
  const [houses] = useCollectionData(HOUSES, {
    idField: 'id',
  });

  function getStartOfToday() {
    const now = new Date();
    const timestamp = firestore.Timestamp.fromDate(now);
    return timestamp; // ex. 1631246400
  }

  useEffect(() => {
    const getQuadrantsWithJobs = async () => {
      const responseQuadrant = await firestore()
        .collection('quadrants')
        .where('date', '>', getStartOfToday())
        .get();
      if (!responseQuadrant.docs.length) {
        return setIsModalVisible(true);
      }
      const quadrant = {
        id: responseQuadrant.docs[0]?.id,
        ...responseQuadrant.docs[0]?.data,
      };
      console.log('[[QUADRANT]]', quadrant);
      const responseJobs = await firestore()
        .collection('quadrants')
        .doc(quadrant.id)
        .collection('jobs')
        .get();
      const jobs = responseJobs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const groupedJobsById = groupBy(jobs, 'houseId');
      setJobs(groupedJobsById);
    };
    getQuadrantsWithJobs();
  }, []);

  return {
    setIsModalVisible,
    isModalVisible,
    houses,
    jobs,
  };
};
