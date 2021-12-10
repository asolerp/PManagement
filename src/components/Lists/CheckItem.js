import React from 'react';

import useNoReadMessages from '../../hooks/useNoReadMessages';

import {CHECKLISTS} from '../../utils/firebaseKeys';
import {parseDateWithText, parsePercentageDone} from '../../utils/parsers';
import useGetChecklistStats from './hooks/useGetChecklistStats';

import useAuth from '../../utils/useAuth';

import {useTranslation} from 'react-i18next';

import {ListItem} from './ListItem';

const CheckItem = ({item, fullWidth}) => {
  const {isOwner} = useAuth();
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: CHECKLISTS,
    docId: item.id,
  });

  const {completePercentage, loadingChecks} = useGetChecklistStats({
    checkId: item.id,
  });

  if (loadingChecks) {
    return null;
  }

  return (
    <ListItem
      withStatusBar
      date={t(parseDateWithText(item?.date).text, {
        numberOfDays: parseDateWithText(item?.date)?.metaData?.numberOfDays,
      })}
      dateVariant={parseDateWithText(item?.date).variant}
      statusColor={parsePercentageDone(completePercentage) || 0}
      statusPercentage={completePercentage || 0}
      title="Checklist"
      subtitle={
        isOwner ? `${t('checklists.owner_text_1')}` : item?.observations
      }
      fullWidth={fullWidth}
      counter={noReadCounter}
      house={item?.house?.[0].houseName}
      workers={item?.workers}
    />
  );
};

export default CheckItem;
