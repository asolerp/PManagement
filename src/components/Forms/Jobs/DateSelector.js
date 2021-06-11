import React, {useState, useEffect} from 'react';
import {View, SafeAreaView} from 'react-native';

//UI
import DatePicker from 'react-native-date-picker';

import CustomButton from '../../Elements/CustomButton';

// Utils
import moment from 'moment';

const DateSelector = ({closeModal, set, get}) => {
  console.log('get', get);
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
    <SafeAreaView
      style={{
        flex: 1,
        width: '100%',
      }}>
      {dateSelected && (
        <DatePicker
          style={{width: 350}}
          date={dateSelected || initialTime}
          onDateChange={setDateSelected}
          locale="es-es"
        />
      )}
      <View style={{marginTop: 'auto'}}>
        <CustomButton
          styled="rounded"
          title={'Seleccionar fecha'}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

export default DateSelector;
