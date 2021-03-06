import {format} from 'date-fns';
import React from 'react';
import {useTranslation} from 'react-i18next';

import useNoReadMessages from '../../hooks/useNoReadMessages';

import {INCIDENCES} from '../../utils/firebaseKeys';
import {parseDateWithText, parseStateIncidecne} from '../../utils/parsers';
import {FinishedListItem} from './FinishedListItem';

import {ListItem} from './ListItem';

const IncidenceItem = ({item, fullWidth}) => {
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: INCIDENCES,
    docId: item.id,
  });

  if (item.done) {
    return (
      <FinishedListItem
        withStatusBar
        date={format(item?.date.toDate(), 'dd/MM/yyyy')}
        statusColor={parseStateIncidecne(item?.state)}
        statusPercentage={1}
        title={item?.title}
        subtitle={item?.incidence}
        counter={noReadCounter}
        house={item?.house?.houseName}
        workers={item?.workers}
      />
    );
  }

  return (
    <ListItem
      date={t(parseDateWithText(item?.date).text, {
        numberOfDays: parseDateWithText(item?.date)?.metaData?.numberOfDays,
      })}
      fullWidth={fullWidth}
      dateVariant={parseDateWithText(item?.date).variant}
      statusColor={parseStateIncidecne(item?.state)}
      statusPercentage={1}
      title={item?.title}
      subtitle={item?.incidence}
      counter={noReadCounter}
      house={item?.house?.houseName}
      workers={item?.workers}
    />
  );
};

export default IncidenceItem;
