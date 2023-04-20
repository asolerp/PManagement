export const sortByDate = (a, b, order = 'asc') => {
  if (a?.date < b?.date) {
    return order === 'asc' ? -1 : 1;
  }
  if (a?.date > b?.date) {
    return order === 'asc' ? 1 : -1;
  }
  return 0;
};

export const sortByDone = (list) => {
  const doneList = list?.filter((el) => !el.done);
  const notDoneList = list?.filter((el) => el.done);
  return [...doneList?.sort(sortByDate), ...notDoneList?.sort(sortByDate)];
};

export const sortByFinished = (list) => {
  const notFinishedList = list?.filter((el) => !el.finished);
  const finishedList = list?.filter((el) => el.finished);
  return [
    ...notFinishedList.sort(sortByDate),
    ...finishedList.sort((a, b) => sortByDate(a, b, 'desc')),
  ];
};

let sortingOrder = {
  iniciada: 1,
  tramite: 2,
  finalizada: 3,
};

export const sortByIncidenceStatus = (key, order = 'asc') => {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const first =
      a[key].toLowerCase() in sortingOrder
        ? sortingOrder[a[key]]
        : Number.MAX_SAFE_INTEGER;
    const second =
      b[key].toLowerCase() in sortingOrder
        ? sortingOrder[b[key]]
        : Number.MAX_SAFE_INTEGER;

    let result = 0;
    if (first < second) {
      result = -1;
    } else if (first > second) {
      result = 1;
    }
    return order === 'desc' ? ~result : result;
  };
};
