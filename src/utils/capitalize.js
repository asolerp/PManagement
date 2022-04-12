export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeText = (text) => {
  const splitedText = text?.split(' ');
  let result = '';

  splitedText?.forEach((word) => {
    result += capitalize(word) + ' ';
  });

  return result;
};
