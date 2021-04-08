import {useState, useEffect} from 'react';
import {useSelector, shallowEqual} from 'react-redux';

import subDays from 'date-fns/subDays';

const useFilter = (storage) => {
  console.log(subDays(new Date(), 1));

  const [where, setWhere] = useState([
    {
      label: 'date',
      operator: '>',
      condition: when || subDays(new Date(), 1),
    },
  ]);

  const {houses, when} = useSelector(
    ({
      filters: {
        [storage]: {houses, when},
      },
    }) => ({houses, when}),
    shallowEqual,
  );

  useEffect(() => {
    if (houses.length > 0) {
      setWhere([
        {
          label: 'houseId',
          operator: 'in',
          condition: houses,
        },
      ]);
    } else {
      setWhere(where?.filter((query) => query.label != 'houses'));
    }
  }, [houses]);

  useEffect(() => {
    if (where) {
      const findIndex = where?.findIndex((filter) => filter.label === 'date');
      const copyState = [...where];
      copyState[findIndex].condition = when;
      setWhere(copyState);
    }
  }, [when]);

  return {
    where,
  };
};

export default useFilter;
