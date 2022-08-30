import {format} from 'date-fns';
import {es} from 'date-fns/locale';

export const today = format(new Date(), 'iii d MMMM yyyy', {locale: es});
