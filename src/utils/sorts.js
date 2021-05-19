const sortByDate = (a, b) => {
  if (a?.data()?.date < b?.data()?.date) {
    return 1;
  }
  if (a?.data()?.date > b?.data()?.date) {
    return -1;
  }
  return 0;
};

export default sortByDate;
