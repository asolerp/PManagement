export const parseRef = (imageRoute) => {
  const url = imageRoute;
  const ref = url.split('/PortManagement');

  return `PortManagement${ref[1]}`;
};
