import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HEIGHT,
  CHECKLIST_DONE,
} from '../constants/colors';
import {Colors} from '../Theme/Variables';

export const minimizetext = (text, numberOfCharts = 40) => {
  return text?.length > numberOfCharts
    ? text.substring(0, numberOfCharts - 3) + '...'
    : text;
};

export const getHightByRoute = (route) => {
  switch (route) {
    case 'Dashboard':
      return 180;
    case 'Home':
      return 180;
    case 'NewHome':
      return 100;
    case 'Incidencias':
      return 100;
    case 'CheckList':
      return 100;
    case 'Jobs':
      return 140;
    case 'Homes':
      return 100;
    case 'Perfil':
      return 100;
    default:
      return 250;
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
