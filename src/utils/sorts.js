const sortByDate = (a, b, order = 'asc') => {
  if (a?.date < b?.date) {
    return order === 'asc' ? -1 : 1;
  }
  if (a?.date > b?.date) {
    return order === 'asc' ? 1 : -1;
  }
  return 0;
};

export default sortByDate;
