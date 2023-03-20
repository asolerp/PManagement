import React, {useState, useEffect} from 'react';
import {View} from 'react-native';

//UI
import DatePicker from 'react-native-date-picker';

import CustomButton from '../../Elements/CustomButton';

// Utils
import moment from 'moment';
import {useLocales} from '../../../utils/useLocales';
import {useTranslation} from 'react-i18next';

const DateSelector = ({closeModal, set, get, mode = 'date'}) => {
  const today = new Date();
  const initialTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    8,
    0,
    0,
  );
  const [dateSelected, setDateSelected] = useState();
  const {t} = useTranslation();
  const {locale} = useLocales();
  useEffect(() => {
    if (get) {
      setDateSelected(get._i);
    } else {
      setDateSelected(initialTime);
    }
  }, []);

  const handleSubmit = () => {
    set(moment(dateSelected));
    closeModal();
  };

  return (
    <>
      <DatePicker
        mode={mode}
        style={{width: 350}}
        date={dateSelected || initialTime}
        onDateChange={setDateSelected}
        locale={locale}
      />
      <View style={{marginTop: 20}}>
        <CustomButton
          styled="rounded"
          title={t('common.save')}
          onPress={handleSubmit}
        />
      </View>
    </>
  );
};

export default DateSelector;
