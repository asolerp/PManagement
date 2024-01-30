import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {getEndOfToday, getStartOfToday} from '../../../utils/dates';

export const useEntrancesManager = () => {
  const queryWorkers = firestore()
    .collection('users')
    .where('role', '==', 'worker');

  const queryEntrances = firestore()
    .collection('entrances')
    .where('date', '>=', getStartOfToday())
    .where('date', '<=', getEndOfToday());

  const [entrances, loading] = useCollectionData(queryEntrances, {
    idField: 'id',
  });

  const [workers] = useCollectionData(queryWorkers, {
    idField: 'id',
  });

  const isTooClose = (coord1, coord2, threshold = 0.0002) => {
    const distance = Math.sqrt(
      Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2),
    );
    return distance < threshold;
  };

  const annotations = entrances?.map((annotation, index, arr) => {
    let {latitude, longitude} = annotation.location;
    // Check proximity to previous annotations
    for (let i = 0; i < index; i++) {
      const other = arr[i];
      console.log('OTHER', other);
      if (
        isTooClose(
          [latitude, longitude],
          [other.location.latitude, other.location.longitude],
        )
      ) {
        // Apply a small offset
        latitude += 0.0001;
        longitude += 0.0001;
      }
    }

    return {...annotation, location: {latitude, longitude}};
  });

  const activeWorkers = workers?.map((worker) =>
    annotations.some((entrance) => entrance.worker.id === worker.id)
      ? {...worker, active: true}
      : {...worker, active: false},
  );

  return {
    loading,
    workers,
    entrances: annotations,
    activeWorkers,
  };
};
