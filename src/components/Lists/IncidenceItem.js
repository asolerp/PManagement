import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useNoReadMessages from '../../hooks/useNoReadMessages';

import { INCIDENCES } from '../../utils/firebaseKeys';
import { parseDateWithText } from '../../utils/parsers';
import ModernIncidenceCard from './ModernIncidenceCard';

const IncidenceItem = ({ item, fullWidth, onPress }) => {
  const { t } = useTranslation();
  const { noReadCounter } = useNoReadMessages({
    collection: INCIDENCES,
    docId: item.id
  });

  const dateInfo = parseDateWithText(item?.date);

  return (
    <ModernIncidenceCard
      title={item?.title}
      description={item?.incidence}
      state={item?.state || 'iniciada'}
      house={item?.house?.houseName}
      workers={item?.workers || []}
      date={t(dateInfo.text, {
        numberOfDays: dateInfo?.metaData?.numberOfDays
      })}
      dateVariant={dateInfo.variant}
      unreadCount={noReadCounter}
      onPress={onPress}
    />
  );
};

export default IncidenceItem;
