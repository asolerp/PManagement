import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HEIGHT,
} from '../constants/colors';
import {Colors} from '../Theme/Variables';

import {
  CHECKLIST_SCREEN_KEY,
  DASHBOARD_OWNER_SCREEN_KEY,
  DASHBOARD_SCREEN_KEY,
  DASHBOARD_WORKER_SCREEN_KEY,
  HOUSES_SCREEN_KEY,
  HOUSE_SCREEN_KEY,
  INCIDENCES_SCREEN_KEY,
  JOBS_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
} from '../Router/utils/routerKeys';

export const minimizetext = (text, numberOfCharts = 40) => {
  return text?.length > numberOfCharts
    ? text.substring(0, numberOfCharts - 3) + '...'
    : text;
};

export const tabNameByScreen = {
  [DASHBOARD_SCREEN_KEY]: 'Dashboard',
  [DASHBOARD_WORKER_SCREEN_KEY]: 'Dashboard',
  [DASHBOARD_OWNER_SCREEN_KEY]: 'Dashboard',
  [CHECKLIST_SCREEN_KEY]: 'Checklists',
  [INCIDENCES_SCREEN_KEY]: 'Incidencias',
  [JOBS_SCREEN_KEY]: 'Trabajos',
  [HOUSES_SCREEN_KEY]: 'Casas',
  [PROFILE_SCREEN_KEY]: 'Perfil',
};

export const getHightByRoute = (route) => {
  console.log(route);
  switch (route) {
    case DASHBOARD_SCREEN_KEY:
      return 180;
    case DASHBOARD_WORKER_SCREEN_KEY:
      return 180;
    case HOUSE_SCREEN_KEY:
      return 180;
    case INCIDENCES_SCREEN_KEY:
      return 100;
    case CHECKLIST_SCREEN_KEY:
      return 100;
    case JOBS_SCREEN_KEY:
      return 100;
    case HOUSES_SCREEN_KEY:
      return 100;
    case PROFILE_SCREEN_KEY:
      return 100;
    default:
      return 100;
  }
};

export const parsePriority = (priority) => {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'medium':
      return 'Media';
    case 'height':
      return 'Alta';
  }
};

export const parsePriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return PRIORITY_LOW;
    case 'medium':
      return PRIORITY_MEDIUM;
    case 'height':
      return PRIORITY_HEIGHT;
  }
};

export const parsePercentageDone = (percentage) => {
  if (percentage <= 0.5) {
    return Colors.danger;
  } else if (percentage > 0.5 && percentage < 1) {
    return Colors.warning;
  } else {
    return Colors.rightGreen;
  }
};

export const parseStateIncidecne = (state) => {
  if (state === 'iniciada') {
    return Colors.warning;
  } else if (state === 'tramite') {
    return Colors.leftBlue;
  } else {
    return Colors.rightGreen;
  }
};

export const parsePirorityIcon = (priority) => {
  switch (priority) {
    case 'low':
      return {
        name: 'arrow-downward',
        color: PRIORITY_LOW,
      };
    case 'medium':
      return {
        name: 'arrow-forward',
        color: PRIORITY_MEDIUM,
      };
    case 'height':
      return {
        name: 'arrow-upward',
        color: PRIORITY_HEIGHT,
      };
    default:
      break;
  }
};

export const parseDateWithText = (date) => {
  if (
    moment(date?.toDate()).format('MM/DD/YYYY') ===
    moment(new Date()).format('MM/DD/YYYY')
  ) {
    return 'Hoy';
  } else if (
    moment(date.toDate()).format('MM/DD/YYYY') <
      moment(new Date()).format('MM/DD/YYYY') &&
    moment(date.toDate()).format('MM/DD/YYYY') >
      moment(new Date()).subtract(7, 'days').format('MM/DD/YYYY')
  ) {
    return 'Esta semana';
  } else {
    return 'Más de una semana';
  }
};

export const generateCalendarDots = (list) => {
  let dotsArray = [];

  list.forEach((job) => {
    const indexDotElement = dotsArray.findIndex((dotObject) => {
      return (
        moment(dotObject?.date).format('DD-MM-YYYY') ===
        moment(job?.date?.toDate()).format('DD-MM-YYYY')
      );
    });
    if (indexDotElement !== -1) {
      const dotsOnFindedDate = {
        date: moment(job?.date?.toDate()),
        dots: dotsArray[indexDotElement].dots.concat([
          {color: parsePriorityColor(job?.priority) || 'black'},
        ]),
      };
      dotsArray[indexDotElement] = dotsOnFindedDate;
    } else {
      dotsArray.push({
        date: moment(job?.date?.toDate()),
        dots: [{color: parsePriorityColor(job?.priority) || 'black'}],
      });
    }
  });

  return dotsArray;
};

export const parseDeleteTextButton = (length) => {
  if (length === 1) {
    return `Eliminar ${length} foto`;
  } else {
    return `Eliminar ${length} fotos`;
  }
};

export const percentageOfComplete = (tasks) => {
  const completedTasks = tasks?.filter((task) => task.complete).length;
  return completedTasks / tasks?.length;
};
