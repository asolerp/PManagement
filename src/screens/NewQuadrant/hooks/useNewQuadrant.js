import {useCollectionDataOnce} from 'react-firebase-hooks/firestore';
import {HOUSES} from '../../../utils/entities';

export const useNewQuadrant = () => {
  const [houses] = useCollectionDataOnce(HOUSES, {
    idField: 'id',
  });

  return {
    houses,
  };
};
