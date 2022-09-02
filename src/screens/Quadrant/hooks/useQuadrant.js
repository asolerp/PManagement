import {useEffect, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {HOUSES} from '../../../utils/entities';
import firestore from '@react-native-firebase/firestore';
import {groupBy} from '../../../utils/arrayManipulations';

export const useQuadrant = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quadrantId, setQuadrantId] = useState();
  const [jobs, setJobs] = useState(undefined);
  const [houses] = useCollectionData(HOUSES, {
    idField: 'id',
  });

  function getStartOfToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function getEndOfToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime());
    end.setHours(23, 59, 59, 999);
    return end;
  }

  const getQuadrantsWithJobs = async () => {
    try {
      setLoading(true);
      const responseQuadrant = await firestore()
        .collection('quadrants')
        .where('date', '>=', getStartOfToday())
        .where('date', '<=', getEndOfToday())

        .get();
      if (!responseQuadrant.docs.length) {
        return setIsModalVisible(true);
      }

      const quadrant = {
        id: responseQuadrant.docs[0]?.id,
        ...responseQuadrant.docs[0]?.data,
      };

      setQuadrantId(quadrant.id);

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
      console.log('GROUPED', groupedJobsById);
      setJobs(groupedJobsById);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getQuadrantsWithJobs();
  }, []);

  return {
    getQuadrantsWithJobs,
    setIsModalVisible,
    isModalVisible,
    quadrantId,
    loading,
    houses,
    jobs,
  };
};
