import React from 'react';
import useNoReadMessages from '../../hooks/useNoReadMessages';

import {Colors} from '../../Theme/Variables';
import {JOBS} from '../../utils/firebaseKeys';
import {parseDateWithText} from '../../utils/parsers';

import {useTranslation} from 'react-i18next';
import {useLocales} from '../../utils/useLocales';
import {ListItem} from './ListItem';
import {FinishedListItem} from './FinishedListItem';
import {format} from 'date-fns';
import moment from 'moment';

const JobItem = ({item, fullWidth}) => {
  const {t} = useTranslation();
  const {locale} = useLocales();
  const {noReadCounter} = useNoReadMessages({
    collection: JOBS,
    docId: item?.id,
  });

  const taksDescByLocale =
    item?.task?.locales?.[locale]?.desc ||
    item?.task?.locales?.en.desc ||
    item?.task?.desc;

  console.log('[[ITEM]]', item);

  if (item.done) {
    return (
      <FinishedListItem
        withStatusBar
        date={format(item?.date.toDate(), 'dd/MM/yyyy')}
        startHour={moment(item?.quadrantStartHour?.toDate()).format('LT')}
        endHour={moment(item?.quadrantEndHour?.toDate()).format('LT')}
        statusColor={Colors.pm}
        title={taksDescByLocale}
        subtitle={item?.observations}
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
      startHour={moment(item?.quadrantStartHour?.toDate()).format('LT')}
      endHour={moment(item?.quadrantEndHour?.toDate()).format('LT')}
      dateVariant={parseDateWithText(item?.date).variant}
      statusColor={Colors.pm}
      statusPercentage={1}
      title={taksDescByLocale}
      subtitle={item?.observations}
      counter={noReadCounter}
      house={item?.house?.houseName}
      workers={item?.workers}
      fullWidth={fullWidth}
    />
  );
};

export default JobItem;
