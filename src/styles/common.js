import {DARK_BLUE} from './colors';

export const defaultTextTitle = {
  fontSize: 25,
  color: DARK_BLUE,
  fontWeight: 'bold',
};

export const defaultLabel = {
  fontSize: 22,
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
