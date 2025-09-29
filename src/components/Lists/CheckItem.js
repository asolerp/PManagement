import React from 'react';
import { parseDateWithText, parsePercentageDone } from '../../utils/parsers';
import useGetChecklistStats from './hooks/useGetChecklistStats';

import useAuth from '../../utils/useAuth';

import { useTranslation } from 'react-i18next';

import { ListItem } from './ListItem';
import { FinishedListItem } from './FinishedListItem';
import { format } from 'date-fns';

const CheckItem = ({ item, fullWidth }) => {
  const { isOwner } = useAuth();
  const { t } = useTranslation();

  const { completePercentage, loadingChecks } = useGetChecklistStats({
    checkId: item.id
  });

  const date = item?.date?._d || item?.date;

  if (loadingChecks) {
    return null;
  }

  if (item.finished) {
    return (
      <FinishedListItem
        date={format(date.toDate(), 'dd/MM/yyyy')}
        title={item?.title}
        house={item?.house?.[0].houseName}
        workers={item?.workers}
        emailSent={item?.send}
        subtitle={
          isOwner
            ? `${t('checklists.owner_text_1')}`
            : item?.observations || 'Sin observaciones'
        }
      />
    );
  }

  return (
    <ListItem
      withStatusBar
      date={t(parseDateWithText(date).text, {
        numberOfDays: parseDateWithText(date)?.metaData?.numberOfDays
      })}
      dateVariant={parseDateWithText(date).variant}
      statusColor={parsePercentageDone(completePercentage) || 0}
      title={item?.title}
      subtitle={
        isOwner
          ? `${t('checklists.owner_text_1')}`
          : item?.observations || 'Sin observaciones'
      }
      fullWidth={fullWidth}
      house={item?.house?.[0].houseName}
      workers={item?.workers}
    />
  );
};

export default CheckItem;
