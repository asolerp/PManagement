import React from 'react';
import { parseDateWithText } from '../../utils/parsers';
import useGetChecklistStats from './hooks/useGetChecklistStats';
import useAuth from '../../utils/useAuth';
import { useTranslation } from 'react-i18next';
import {
  ActiveChecklistCard,
  FinishedChecklistCard
} from './ModernChecklistCard';
import { format } from 'date-fns';
import { openScreenWithPush } from '../../Router/utils/actions';
import { CHECK_SCREEN_KEY } from '../../Router/utils/routerKeys';

const CheckItem = ({ item }) => {
  const { isOwner } = useAuth();
  const { t } = useTranslation();

  const { loadingChecks } = useGetChecklistStats({
    checkId: item.id
  });

  const date = item?.date?._d || item?.date;

  const handlePress = () => {
    openScreenWithPush(CHECK_SCREEN_KEY, {
      docId: item.id,
      title: item?.house?.[0]?.houseName || 'Checklist'
    });
  };

  if (loadingChecks) {
    return null;
  }

  const formattedDate = format(date.toDate(), 'dd/MM/yyyy');
  const dateInfo = parseDateWithText(date);
  const subtitle = isOwner
    ? t('checklists.owner_text_1')
    : item?.observations || '';

  if (item.finished) {
    return (
      <FinishedChecklistCard
        date={formattedDate}
        dateVariant={dateInfo.variant}
        house={item?.house?.[0]?.houseName}
        workers={item?.workers || []}
        startHour={item?.startHour}
        endHour={item?.endHour}
        subtitle={subtitle}
        emailSent={item?.send}
        onPress={handlePress}
      />
    );
  }

  return (
    <ActiveChecklistCard
      date={t(dateInfo.text, {
        numberOfDays: dateInfo?.metaData?.numberOfDays
      })}
      dateVariant={dateInfo.variant}
      house={item?.house?.[0]?.houseName}
      workers={item?.workers || []}
      startHour={item?.startHour}
      endHour={item?.endHour}
      subtitle={subtitle}
      done={item?.done || 0}
      total={item?.total || 0}
      onPress={handlePress}
    />
  );
};

export default CheckItem;
