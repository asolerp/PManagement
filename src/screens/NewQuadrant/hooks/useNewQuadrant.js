import {useCollectionDataOnce} from 'react-firebase-hooks/firestore';
import {popScreen} from '../../../Router/utils/actions';
import {HOUSES} from '../../../utils/entities';
import firestore from '@react-native-firebase/firestore';

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
      const colRef = firestore()
        .collection('quadrants')
        .doc(quadrantId)
        .collection('jobs');
      colRef.get().then(async (querySnapshot) => {
        await Promise.all(querySnapshot.docs.map((d) => d.ref.delete()));
      });
      const colRefJobs = firestore()
        .collection('jobs')
        .where('quadrantId', '==', quadrantId);
      colRefJobs.get().then(async (querySnapshot) => {
        await Promise.all(querySnapshot.docs.map((d) => d.ref.delete()));
      });
      await firestore().collection('quadrants').doc(quadrantId).update({date});
      await Promise.all(
        jobs.map(
          async (job) =>
            await firestore()
              .collection('quadrants')
              .doc(quadrantId)
              .collection('jobs')
              .add({
                ...job,
                quadrantId,
                startHour: job?.startHour?._i || job?.startHour,
                endHour: job?.endHour?._i || job?.endHour,
              }),
        ),
      );
    } catch (err) {
      console.log(err);
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
      const response = await firestore().collection('quadrants').add({
        date,
      });
      await Promise.all(
        jobs.map(
          async (job) =>
            await firestore()
              .collection('quadrants')
              .doc(response.id)
              .collection('jobs')
              .add({
                ...job,
                quadrantId: response.id,
                startHour: job?.startHour?._i,
                endHour: job?.endHour?._i,
              }),
        ),
      );
    } catch (err) {
      console.log(err);
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
