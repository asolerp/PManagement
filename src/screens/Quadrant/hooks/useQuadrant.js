import {useEffect, useState} from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {HOUSES} from '../../../utils/entities';
import { getFirestore, collection, query, where, getDocs, doc } from '@react-native-firebase/firestore';
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
      const db = getFirestore();
      const quadrantsQuery = query(
        collection(db, 'quadrants'),
        where('date', '>=', getStartOfToday()),
        where('date', '<=', getEndOfToday())
      );
      
      const responseQuadrant = await getDocs(quadrantsQuery);
      
      if (!responseQuadrant.docs.length) {
        return setIsModalVisible(true);
      }

      const quadrant = {
        id: responseQuadrant.docs[0]?.id,
        ...responseQuadrant.docs[0]?.data(),
      };

      setQuadrantId(quadrant.id);

      const jobsCollection = collection(
        doc(collection(db, 'quadrants'), quadrant.id),
        'jobs'
      );
      const responseJobs = await getDocs(jobsCollection);
      
      const jobs = responseJobs.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      const groupedJobsById = groupBy(jobs, 'houseId');
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
