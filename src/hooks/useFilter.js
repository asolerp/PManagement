import {useState, useEffect} from 'react';
import {useSelector, shallowEqual} from 'react-redux';

import subDays from 'date-fns/subDays';

//Firebase
import {useGetFirebase} from '../hooks/useGetFirebase';

const useFilter = (storage) => {
  const [where, setWhere] = useState([
    {
      label: 'date',
      operator: '>=',
      condition: from || new Date(),
    },
  ]);

  const {list, loading} = useGetFirebase(storage, null, where);
  const [filteredList, setFilteredList] = useState([]);
  const {houses, from, to} = useSelector(
    ({
      filters: {
        [storage]: {houses, from, to},
      },
    }) => ({houses, from, to}),
    shallowEqual,
  );

  useEffect(() => {
    if (list) {
      setFilteredList(list);
    }
  }, [list]);

  useEffect(() => {
    if (from) {
      setWhere([
        ...where
          .filter((query) => query.operator != '>=')
          .concat([
            {
              label: 'date',
              operator: '>=',
              condition: subDays(from, 1),
            },
          ]),
      ]);
    }
  }, [from]);

  useEffect(() => {
    if (to) {
      setWhere([
        ...where
          .filter((query) => query.operator != '<=')
          .concat([
            {
              label: 'date',
              operator: '<=',
              condition: to,
            },
          ]),
      ]);
    }
  }, [to]);

  useEffect(() => {
    if (houses.length > 0) {
      console.log(
        filteredList?.filter((item) => houses.includes(item.houseId)),
        'casas',
      );
      setFilteredList([
        ...list?.filter((item) => houses.includes(item.houseId)),
      ]);
    } else {
      setFilteredList(list);
    }
  }, [houses]);

  console.log(where);
  console.log(filteredList);

  return {
    filteredList,
    loading,
  };
};

export default useFilter;
