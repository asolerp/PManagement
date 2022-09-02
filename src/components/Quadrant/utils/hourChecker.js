import {differenceInHours} from 'date-fns';
import moment from 'moment';
import {CELL_WIDTH} from '../Row';

export const isBetweenHours = ({start, end, time}) => {
  return time >= start && time <= end;
};

const mapXPositionByStartHour = {
  ['8:00']: 1,
  ['8:30']: 1.5,
  ['9:00']: 2,
  ['9:30']: 2.5,
  ['10:00']: 3,
  ['10:30']: 3.5,
  ['11:00']: 4,
  ['11:30']: 4.5,
  ['12:00']: 5,
  ['12:30']: 5.5,
  ['13:00']: 6,
  ['13:30']: 6.5,
  ['14:00']: 7,
  ['14:30']: 7.5,
  ['15:00']: 8,
  ['15:30']: 8.5,
  ['16:00']: 9,
};

export const startXDependingStartHour = (startHour) => {
  const minifiedStartHour = moment(startHour).format('LT');
  return mapXPositionByStartHour[minifiedStartHour];
};

export const widthDependingNumberOfHour = (startHour, endHour) => {
  return differenceInHours(endHour, startHour) * CELL_WIDTH;
};
