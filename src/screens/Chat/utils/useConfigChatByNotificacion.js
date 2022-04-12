import {openScreenWithPush} from '../../../Router/utils/actions';
import {
  CHECK_STACK_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
} from '../../../Router/utils/routerKeys';
import {CHECKLISTS, INCIDENCES, JOBS} from '../../../utils/firebaseKeys';
import firestore from '@react-native-firebase/firestore';
import {useDocumentDataOnce} from 'react-firebase-hooks/firestore';
import {useTranslation} from 'react-i18next';
import {parseEntities} from '../../../utils/parsers';

const {useLocales} = require('../../../utils/useLocales');

export const useConfigChatByNotification = ({
  collection,
  task,
  docId,
  notification,
}) => {
  const {t} = useTranslation();
  const {locale} = useLocales();
  let header;

  if (task) {
    header =
      JSON.parse(task)?.locales?.[locale]?.desc ||
      JSON.parse(task)?.locales?.en?.desc ||
      JSON.parse(task)?.desc;
  }

  const handlerOnPressByNotification = () => {
    if (collection === JOBS) {
      return () => {
        openScreenWithPush(JOB_SCREEN_KEY, {
          jobId: docId,
        });
      };
    }
    if (collection === CHECKLISTS) {
      return () => {
        openScreenWithPush(CHECK_STACK_KEY, {
          docId,
        });
      };
    }
    if (collection === INCIDENCES) {
      return () => {
        openScreenWithPush(INCIDENCE_SCREEN_KEY, {
          incidenceId: docId,
        });
      };
    }
  };

  const [chat] = useDocumentDataOnce(
    firestore().collection(collection).doc(docId),
    {
      idField: 'id',
    },
  );

  const headerChat = () => {
    if (collection === INCIDENCES) {
      return t('chat.view_incidence');
    }
    if (collection === CHECKLISTS) {
      return t('chat.view_checklist');
    }
  };

  return {
    header: notification
      ? header || headerChat()
      : `${parseEntities[collection]} chat`,
    onPressHeader: handlerOnPressByNotification(),
    chat,
  };
};
