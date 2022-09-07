export const getDefaultValues = registry =>
  Object.values(registry).reduce(
    (output, {key, defaultValue}) => ({
      ...output,
      [key]: defaultValue || false,
    }),
    {},
  );

export const compareToggleValues = (value1, value2) =>
  value1 + '' === value2 + '';
