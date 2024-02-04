import {format} from 'date-fns';
import {es} from 'date-fns/locale';

export const today = format(new Date(), 'iii d MMMM yyyy', {locale: es});

export const getStartOfToday = (offset = 0) => {
  const start = new Date();
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfToday = (offset = 0) => {
  const start = new Date();
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime());
  end.setHours(23, 59, 59, 999);
  return end;
};
