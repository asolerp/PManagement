import {format} from 'date-fns';
import {es} from 'date-fns/locale';

export const today = format(new Date(), 'iii d MMMM yyyy', {locale: es});

export const getStartOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime());
  end.setHours(23, 59, 59, 999);
  return end;
};
