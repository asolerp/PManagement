import moment from 'moment';
import i18n from '../Translations/index';

import {
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HEIGHT
} from '../constants/colors';
import { Colors } from '../Theme/Variables';

import {
  CHECKLIST_SCREEN_KEY,
  CUADRANTE_SCREEN_KEY,
  DASHBOARD_OWNER_SCREEN_KEY,
  DASHBOARD_SCREEN_KEY,
  DASHBOARD_WORKER_SCREEN_KEY,
  ENTRANCES_MANAGER_SCREEN_KEY,
  FILTERS_SCREEN_KEY,
  HOUSES_SCREEN_KEY,
  HOUSE_SCREEN_KEY,
  INCIDENCES_SCREEN_KEY,
  JOBS_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
  QUADRANT_SCREEN_KEY,
  USERS_SCREEN_KEY
} from '../Router/utils/routerKeys';
import { isIOS } from './platform';
import { differenceInDays, format, isSameDay, subDays } from 'date-fns';

export const minimizetext = (text, numberOfCharts = 40) => {
  return text?.length > numberOfCharts
    ? text.substring(0, numberOfCharts - 3) + '...'
    : text;
};

export const tabNameByScreen = {
  [DASHBOARD_SCREEN_KEY]: 'tabs.dashboard',
  [USERS_SCREEN_KEY]: 'tabs.users',
  [ENTRANCES_MANAGER_SCREEN_KEY]: 'tabs.entrances',
  [DASHBOARD_WORKER_SCREEN_KEY]: 'tabs.dashboard',
  [QUADRANT_SCREEN_KEY]: 'tabs.quadrant',
  [DASHBOARD_OWNER_SCREEN_KEY]: 'tabs.dashboard',
  [CHECKLIST_SCREEN_KEY]: 'tabs.checks',
  [INCIDENCES_SCREEN_KEY]: 'tabs.incidences',
  [JOBS_SCREEN_KEY]: 'tabs.jobs',
  [HOUSES_SCREEN_KEY]: 'tabs.houses',
  [PROFILE_SCREEN_KEY]: 'tabs.profile'
};

export const getHightByRoute = route => {
  switch (route) {
    case DASHBOARD_SCREEN_KEY:
      return isIOS ? 70 : 20;
    case DASHBOARD_WORKER_SCREEN_KEY:
      return isIOS ? 70 : 20;
    case HOUSE_SCREEN_KEY:
      return isIOS ? 180 : 20;
    case INCIDENCES_SCREEN_KEY:
      return isIOS ? 80 : 20;
    case CHECKLIST_SCREEN_KEY:
      return isIOS ? 80 : 20;
    case JOBS_SCREEN_KEY:
      return isIOS ? 80 : 20;
    case HOUSES_SCREEN_KEY:
      return isIOS ? 30 : 20;
    case PROFILE_SCREEN_KEY:
      return isIOS ? 80 : 20;
    case FILTERS_SCREEN_KEY:
      return isIOS ? 50 : 30;
    default:
      return isIOS ? 30 : 20;
  }
};

export const parsePriority = priority => {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'medium':
      return 'Media';
    case 'height':
      return 'Alta';
  }
};

export const parsePriorityColor = priority => {
  switch (priority) {
    case 'low':
      return PRIORITY_LOW;
    case 'medium':
      return PRIORITY_MEDIUM;
    case 'height':
      return PRIORITY_HEIGHT;
  }
};

export const parsePercentageDone = percentage => {
  if (percentage <= 0.5) {
    return Colors.danger;
  } else if (percentage > 0.5 && percentage < 1) {
    return Colors.warning;
  } else {
    return Colors.rightGreen;
  }
};

export const parseStateIncidecne = state => {
  if (state === 'initiate') {
    return Colors.warning;
  } else if (state === 'process') {
    return Colors.leftBlue;
  } else {
    return Colors.rightGreen;
  }
};

export const parsePirorityIcon = priority => {
  switch (priority) {
    case 'low':
      return {
        name: 'arrow-downward',
        color: PRIORITY_LOW
      };
    case 'medium':
      return {
        name: 'arrow-forward',
        color: PRIORITY_MEDIUM
      };
    case 'height':
      return {
        name: 'arrow-upward',
        color: PRIORITY_HEIGHT
      };
    default:
      break;
  }
};

export const parseTimeFilter = time => {
  const filter = {
    all: {
      filter: 'all',
      start: moment(new Date()).subtract(5, 'year'),
      end: moment(new Date()).add(1, 'year')
    },
    week: {
      filter: 'week',
      start: moment(new Date()).subtract(7, 'days'),
      end: moment(new Date())
    },
    month: {
      filter: 'month',
      start: moment(new Date()).subtract(1, 'month'),
      end: moment(new Date())
    },
    year: {
      filter: 'year',
      start: moment(new Date()).subtract(1, 'year'),
      end: moment(new Date())
    }
  };

  return filter[time];
};

export const parseDateWithText = date => {
  if (date && typeof date.toDate === 'function') {
    const inOneWeek = format(subDays(new Date(), 7), 'dd/MM/yyyy');
    const diff = differenceInDays(date?.toDate(), new Date());

    if (isSameDay(date?.toDate(), new Date())) {
      return {
        text: 'common.range_time.today',
        variant: 'pm'
      };
    }

    if (date.toDate() < new Date()) {
      return {
        text: 'common.range_time.past',
        metaData: { numberOfDays: diff * -1 + 1 },
        variant: 'danger'
      };
    }

    if (date.toDate() > new Date()) {
      return {
        text: 'common.range_time.next',
        metaData: { numberOfDays: diff + 1 },
        variant: 'pm'
      };
    }
    if (date.toDate() < new Date() && date.toDate() > inOneWeek) {
      return {
        text: 'common.range_time.week',
        variant: 'warning'
      };
    } else {
      return {
        text: 'common.range_time.more_week',
        variant: 'danger'
      };
    }
  } else {
    return {
      text: 'Error en la fecha',
      varint: 'pm'
    };
  }
};

export const generateCalendarDots = list => {
  let dotsArray = [];

  list.forEach(job => {
    const indexDotElement = dotsArray.findIndex(dotObject => {
      return (
        moment(dotObject?.date).format('DD-MM-YYYY') ===
        moment(job?.date?.toDate()).format('DD-MM-YYYY')
      );
    });
    if (indexDotElement !== -1) {
      const dotsOnFindedDate = {
        date: moment(job?.date?.toDate()),
        dots: dotsArray[indexDotElement].dots.concat([
          { color: parsePriorityColor(job?.priority) || 'black' }
        ])
      };
      dotsArray[indexDotElement] = dotsOnFindedDate;
    } else {
      dotsArray.push({
        date: moment(job?.date?.toDate()),
        dots: [{ color: parsePriorityColor(job?.priority) || 'black' }]
      });
    }
  });

  return dotsArray;
};

export const parseDeleteTextButton = length => {
  if (length === 1) {
    return `Eliminar ${length} foto`;
  } else {
    return `Eliminar ${length} fotos`;
  }
};

export const percentageOfComplete = tasks => {
  const completedTasks = tasks?.filter(task => task.complete).length;
  return completedTasks / tasks?.length;
};

export const parseEntities = {
  checklists: i18n.t('checklists.title'),
  incidences: i18n.t('incidence.title'),
  jobs: i18n.t('job.title')
};
