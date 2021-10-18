// Colors
export const Colors = {
  white: '#FFFFFF',
  grey: '#EAEAEA',
  lowGrey: '#f2f2f2',
  darkGrey: '#878787',
  darkBlue: '#284748',
  success: '#58BFC0',
  successLow: '#58BFC020',
  warning: '#F5C66D',
  warningLow: '#F5C66D20',
  danger: '#ED7A7A',
  dangerLow: '#ED7A7A20',
  leftBlue: '#126D9B',
  mediterranean: '#54A3AC',
  rightGreen: '#67B26F',
  pm: '#55A5AD',
  pmLow: '#55A5AD20',
  purpleLow: 'rgb(243, 240, 250)',
  purple: 'rgb(136, 112, 213)',
  black: 'black',
};

export const Variants = {
  pm: {
    backgroundColor: Colors.pmLow,
    color: Colors.pm,
  },
  filter: {
    backgroundColor: `${Colors.success}30`,
    color: Colors.black,
    borderColor: Colors.pm,
  },
  dangerFilter: {
    backgroundColor: `${Colors.danger}30`,
    color: Colors.black,
    borderColor: Colors.danger,
  },
  successFilter: {
    backgroundColor: `${Colors.rightGreen}30`,
    color: Colors.black,
    borderColor: Colors.rightGreen,
  },
  warningFilter: {
    backgroundColor: `${Colors.warning}30`,
    color: Colors.black,
    borderColor: Colors.warning,
  },
  success: {
    backgroundColor: Colors.successLow,
    color: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warningLow,
    color: Colors.warning,
  },
  danger: {
    backgroundColor: Colors.dangerLow,
    color: Colors.danger,
  },
  purple: {
    backgroundColor: Colors.purpleLow,
    color: Colors.purple,
  },
};

export const NavigationColors = {
  primary: Colors.primary,
};

// FontSize
export const FontSize = {
  tiny: 10,
  xs: 14,
  small: 16,
  regular: 20,
  large: 40,
};

// Metric Sizes
const tiny = 5;
const small = tiny * 2;
const medium = small * 2;
const regular = tiny * 5;
const large = regular * 2;

export const MetricsSizes = {
  tiny,
  small,
  medium,
  regular,
  large,
};
