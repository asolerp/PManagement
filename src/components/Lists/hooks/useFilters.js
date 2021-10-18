export const useFilters = ({list, filters, type}) => {
  const {houses, workers, state} = filters;

  console.log(state);

  const commonFilters = {
    houseId: (houseId) =>
      !houses || houses.length === 0
        ? true
        : houses?.some((hId) => hId === houseId),
    workersId: (workersId) =>
      !workers || workers.length === 0
        ? true
        : workers?.some((wId) => workersId?.some((w2Id) => w2Id === wId)),
  };

  const incidenceFilters = {
    state: (st) => (!state ? true : state === st),
  };

  const filterArray = (array, cfilters) => {
    const filterKeys = Object.keys(cfilters);
    return array?.filter((item) => {
      return filterKeys.every((key) => {
        if (typeof cfilters[key] !== 'function') {
          return true;
        }
        return cfilters[key](item[key]);
      });
    });
  };

  const getCommonFilters = () => ({...commonFilters});
  const getTypeFilters = () => {
    if (type === 'incidences') {
      return {...incidenceFilters};
    }
  };

  const listFiltered = filterArray(list, {
    ...getCommonFilters(),
    ...getTypeFilters(),
  });

  return {
    filteredList: listFiltered,
  };
};
