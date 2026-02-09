import {useCollectionDataOnce} from 'react-firebase-hooks/firestore';
import {popScreen} from '../../../Router/utils/actions';
import {HOUSES} from '../../../utils/entities';
import { getFirestore, collection, doc, getDocs, deleteDoc, updateDoc, addDoc, query, where } from '@react-native-firebase/firestore';
import { Logger } from '../../../lib/logging';

export const useNewQuadrant = () => {
  const [houses] = useCollectionDataOnce(HOUSES, {
    idField: 'id',
  });

  const handleEditQuadrant = async ({date, quadrant, quadrantId}) => {
    const jobs = Object.entries(quadrant).reduce(
      (acc, [key, value]) => [...acc, ...value],
      [],
    );
    try {
      const db = getFirestore();
      
      // Delete existing jobs in quadrant subcollection
      const colRef = collection(doc(collection(db, 'quadrants'), quadrantId), 'jobs');
      const jobsSnapshot = await getDocs(colRef);
      await Promise.all(jobsSnapshot.docs.map((d) => deleteDoc(d.ref)));
      
      // Delete jobs with this quadrantId
      const colRefJobs = query(
        collection(db, 'jobs'),
        where('quadrantId', '==', quadrantId)
      );
      const mainJobsSnapshot = await getDocs(colRefJobs);
      await Promise.all(mainJobsSnapshot.docs.map((d) => deleteDoc(d.ref)));
      
      // Update quadrant date
      const quadrantRef = doc(collection(db, 'quadrants'), quadrantId);
      await updateDoc(quadrantRef, {date});
      
      // Add new jobs
      await Promise.all(
        jobs.map(
          async (job) => {
            const jobsCollection = collection(quadrantRef, 'jobs');
            return await addDoc(jobsCollection, {
              ...job,
              quadrantId,
              startHour: job?.startHour?._i || job?.startHour,
              endHour: job?.endHour?._i || job?.endHour,
            });
          }
        ),
      );
    } catch (err) {
      Logger.error('Error editing quadrant', err, { quadrantId });
    } finally {
      popScreen();
    }
  };

  const handlePressNewQuadrant = async ({date, quadrant}) => {
    const jobs = Object.entries(quadrant).reduce(
      (acc, [key, value]) => [...acc, ...value],
      [],
    );

    try {
      const db = getFirestore();
      const quadrantsCollection = collection(db, 'quadrants');
      const response = await addDoc(quadrantsCollection, {date});
      
      await Promise.all(
        jobs.map(
          async (job) => {
            const jobsCollection = collection(
              doc(collection(db, 'quadrants'), response.id),
              'jobs'
            );
            return await addDoc(jobsCollection, {
              ...job,
              quadrantId: response.id,
              startHour: job?.startHour?._i,
              endHour: job?.endHour?._i,
            });
          }
        ),
      );
    } catch (err) {
      Logger.error('Error creating new quadrant', err);
    } finally {
      popScreen();
    }
  };

  return {
    houses,
    handleEditQuadrant,
    handlePressNewQuadrant,
  };
};
