import {DARK_BLUE} from './colors';

export const defaultTextTitle = {
  fontSize: 25,
  color: DARK_BLUE,
  fontWeight: 'bold',
};

export const defaultLabel = {
  fontSize: 16,
  fontWeight: 'bold',
  color: DARK_BLUE,
};

export const marginBottom = (number) => ({
  marginBottom: number,
});

export const marginRight = (number) => ({
  marginRight: number,
});

export const marginTop = (number) => ({
  marginTop: number,
});

export const marginLeft = (number) => ({
  marginLeft: number,
});

export const width = (number) => ({
  width: `${number}%`,
});

export const normalShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  borderRadius: 20,
};
