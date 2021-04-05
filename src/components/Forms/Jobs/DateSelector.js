import React, {useState, useCallback} from 'react';
import {View, SafeAreaView, Platform, StyleSheet} from 'react-native';

import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {setInputForm, resetForm} from '../../../store/jobFormActions';

//UI
import CalendarStrip from 'react-native-calendar-strip';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../Elements/CustomButton';

// Utils
import moment from 'moment';
import setHours from 'date-fns/set';
import {} from 'react-native';

const styles = StyleSheet.create({
  container: {},
  calendarContainer: {
    width: '100%',
    height: 90,
    paddingHorizontal: 5,
  },
  dateNumberStyle: {color: 'black', fontSize: 20},
  calendarHeaderContainerStyle: {},
  calendarHeaderStyle: {
    color: 'black',
    textTransform: 'capitalize',
  },
  highlightDateNameStyle: {
    color: 'white',
  },
  highlightDateNumberStyle: {
    fontSize: 20,
    color: 'white',
  },
  highlightDateContainerStyle: {
    backgroundColor: '#388088',
  },
  parentHr: {
    height: 1,
    backgroundColor: '#EAEAEA',
    width: '100%',
  },
});

const DateSelector = ({closeModal}) => {
  const dispatch = useDispatch();
  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);
  const {filterDate} = useSelector(
    ({filters: {filterDate}}) => ({filterDate}),
    shallowEqual,
  );

  const today = new Date();
  const initialTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    8,
    0,
    0,
  );

  const [dateSelected, setDateSelected] = useState(job?.date || filterDate);
  const [timeSelected, setTimeSelected] = useState(job?.time || initialTime);

  const setInputFormAction = useCallback(
    (label, value) => dispatch(setInputForm(label, value)),
    [dispatch],
  );

  const handleSubmit = () => {
    console.log(job);
    setInputFormAction('date', moment(dateSelected));
    setInputFormAction('time', moment(timeSelected));
    closeModal();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: '100%',
        height: 200,
      }}>
      <CalendarStrip
        selectedDate={job?.date || moment(new Date())}
        onDateSelected={(date) => setDateSelected(date)}
        scrollable
        style={styles.calendarContainer}
        iconStyle={{color: 'black'}}
        leftSelector={
          <Icon name="keyboard-arrow-left" size={15} color="black" />
        }
        rightSelector={
          <Icon name="keyboard-arrow-right" size={15} color="black" />
        }
        dateContainerStyle={{color: 'black'}}
        dateNameStyle={{color: 'black'}}
        dateNumberStyle={styles.dateNumberStyle}
        highlightDateNameStyle={styles.highlightDateNameStyle}
        highlightDateNumberStyle={styles.highlightDateNumberStyle}
        highlightDateContainerStyle={styles.highlightDateContainerStyle}
        calendarHeaderContainerStyle={styles.calendarHeaderContainerStyle}
        calendarHeaderStyle={styles.calendarHeaderStyle}
      />

      <View style={styles.parentHr} />
      <DateTimePicker
        testID="dateTimePicker"
        value={timeSelected}
        is24Hour={true}
        mode={'time'}
        locale="es-ES"
        display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
        onChange={(event, selectedDate) => setTimeSelected(selectedDate)}
      />
      <View style={{marginTop: 'auto'}}>
        <CustomButton title={'Seleccionar fecha'} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

export default DateSelector;
