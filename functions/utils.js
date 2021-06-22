const removeUserActionToken = (list, userToken) =>
  list.filter((token) => token !== userToken);

module.exports = {
  removeUserActionToken,
};
