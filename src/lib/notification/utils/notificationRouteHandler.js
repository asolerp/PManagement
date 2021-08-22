import {openScreenWithPush} from '../../../Router/utils/actions';
import {
  CHAT_SCREEN_KEY,
  CHECK_STACK_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
} from '../../../Router/utils/routerKeys';
import {CHECKLISTS, INCIDENCES, JOBS} from '../../../utils/firebaseKeys';

export const notificationRouteHandler = ({
  type,
  collection,
  data,
  mainStack,
}) => {
  if (type === 'entity') {
    if (collection === JOBS) {
      return openScreenWithPush(mainStack, {
        screen: JOB_SCREEN_KEY,
        ...data,
        notification: true,
      });
    }
    if (collection === INCIDENCES) {
      return openScreenWithPush(mainStack, {
        screen: INCIDENCE_SCREEN_KEY,
        ...data,
        notification: true,
      });
    }
    if (collection === CHECKLISTS) {
      return openScreenWithPush(mainStack, {
        screen: CHECK_STACK_KEY,
        ...data,
        notification: true,
      });
    }
  }

  if (type === 'chat') {
    openScreenWithPush(CHAT_SCREEN_KEY, {
      ...data,
      notification: true,
    });
  }
};
