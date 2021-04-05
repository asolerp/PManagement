import React, {useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

import {View, Switch, Text, StyleSheet} from 'react-native';

const DateInputCustom = ({label, value}) => {
  const [date, setDate] = useState(new Date());
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.datePickerWrapper}>
        <Text style={styles.label}>{label}</Text>
        {/* <TouchableOpacity onPress={() => setShow(true)}>
        <View style={styles.inputWrapper} />
      </TouchableOpacity> */}
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          display="default"
          locale="es-ES"
          onChange={onChange}
        />
      </View>
      <View>
        <Text style={styles.label}>Recurrente</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  datePickerWrapper: {
    flex: 1,
  },
  label: {
    marginBottom: 10,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 50,
    width: '100%',
  },
});

export default DateInputCustom;
