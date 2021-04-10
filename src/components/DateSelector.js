import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

import {Platform} from 'react-native';

const DateSelector = ({date, selectDate, minimumDate, maximumDate}) => {
  return (
    <DateTimePicker
      testID="dateTimePicker"
      value={date || new Date()}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      is24Hour={true}
      mode={'date'}
      locale="es-ES"
      display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
      onChange={(event, selectedDate) => selectDate(selectedDate)}
    />
  );
};

export default DateSelector;
