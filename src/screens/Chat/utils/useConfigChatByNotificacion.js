import { openScreenWithPush } from '../../../Router/utils/actions';
import {
  CHECK_SCREEN_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY
} from '../../../Router/utils/routerKeys';
import { CHECKLISTS, INCIDENCES, JOBS } from '../../../utils/firebaseKeys';
import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useTranslation } from 'react-i18next';
import { parseEntities } from '../../../utils/parsers';

const { useLocales } = require('../../../utils/useLocales');

export const useConfigChatByNotification = ({
  collection: collectionName,
  task,
  docId,
  notification
}) => {
  const { t } = useTranslation();
  const { locale } = useLocales();
  let header;

  if (task) {
    header =
      JSON.parse(task)?.locales?.[locale]?.desc ||
      JSON.parse(task)?.locales?.en?.desc ||
      JSON.parse(task)?.desc;
  }

  const handlerOnPressByNotification = () => {
    if (collectionName === JOBS) {
      return () => {
        openScreenWithPush(JOB_SCREEN_KEY, {
          jobId: docId
        });
      };
    }
    if (collectionName === CHECKLISTS) {
      return () => {
        openScreenWithPush(CHECK_SCREEN_KEY, {
          docId
        });
      };
    }
    if (collectionName === INCIDENCES) {
      return () => {
        openScreenWithPush(INCIDENCE_SCREEN_KEY, {
          incidenceId: docId
        });
      };
    }
  };

  const db = getFirestore();
  const docRef = doc(collection(db, collectionName), docId);

  const [chat] = useDocumentDataOnce(docRef, {
    idField: 'id'
  });

  const headerChat = () => {
    if (collectionName === INCIDENCES) {
      return t('chat.view_incidence');
    }
    if (collectionName === CHECKLISTS) {
      return t('chat.view_checklist');
    }
  };

  return {
    header: notification
      ? header || headerChat()
      : `${parseEntities[collectionName]} chat`,
    onPressHeader: handlerOnPressByNotification(),
    chat
  };
};
