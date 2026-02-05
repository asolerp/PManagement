import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { useLocales } from '../../../utils/useLocales';
import { useTranslation } from 'react-i18next';

// UI
import CustomButton from '../../Elements/CustomButton';

const DateSelector = ({ closeModal, set, get, mode = 'date' }) => {
  const today = new Date();
  const initialTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    8,
    0,
    0
  );

  const [dateSelected, setDateSelected] = useState();
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const { t } = useTranslation();
  const { locale } = useLocales();

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

  const handleDateChange = (event, selectedDate) => {
    // Android: close picker after selection
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      if (event.type === 'set' && selectedDate) {
        setDateSelected(selectedDate);
      }
      // 'dismissed' = user cancelled, do nothing
    } else {
      // iOS: update value directly (spinner is always visible)
      if (selectedDate) {
        setDateSelected(selectedDate);
      }
    }
  };

  // Quick actions for date mode
  const handleQuickSelect = days => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    // Preserve time if in date mode
    if (dateSelected) {
      newDate.setHours(dateSelected.getHours());
      newDate.setMinutes(dateSelected.getMinutes());
    }
    setDateSelected(newDate);
  };

  // Format selected date for preview
  const getFormattedPreview = () => {
    if (!dateSelected) return '';

    if (mode === 'time') {
      return moment(dateSelected).format('HH:mm');
    }

    const selectedMoment = moment(dateSelected);
    const isToday = selectedMoment.isSame(moment(), 'day');
    const isTomorrow = selectedMoment.isSame(moment().add(1, 'day'), 'day');

    if (isToday) return t('common.today');
    if (isTomorrow) return t('common.tomorrow');

    return selectedMoment.format('DD MMM YYYY');
  };

  // Get formatted value for Android trigger button
  const getAndroidTriggerText = () => {
    if (!dateSelected) {
      return mode === 'time' ? '08:00' : t('common.select_date');
    }

    if (mode === 'time') {
      return moment(dateSelected).format('HH:mm');
    }
    return moment(dateSelected).format('dddd, DD MMMM YYYY');
  };

  // Render the DateTimePicker based on platform
  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      // iOS: Inline spinner picker with fixed height
      return (
        <View style={styles.pickerContainerIOS}>
          <DateTimePicker
            mode={mode}
            value={dateSelected || initialTime}
            onChange={handleDateChange}
            locale={locale}
            display="spinner"
            style={styles.pickerIOS}
            textColor="#111827"
          />
        </View>
      );
    }

    // Android: Trigger button + native picker overlay
    return (
      <>
        <Pressable
          style={({ pressed }) => [
            styles.androidTrigger,
            pressed && styles.androidTriggerPressed
          ]}
          onPress={() => setShowAndroidPicker(true)}
        >
          <Icon
            name={mode === 'time' ? 'access-time' : 'calendar-today'}
            size={22}
            color="#55A5AD"
          />
          <Text style={styles.androidTriggerText}>
            {getAndroidTriggerText()}
          </Text>
          <Icon name="edit" size={18} color="#9CA3AF" />
        </Pressable>

        {showAndroidPicker && (
          <DateTimePicker
            mode={mode}
            value={dateSelected || initialTime}
            onChange={handleDateChange}
            display={mode === 'time' ? 'spinner' : 'calendar'}
          />
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with preview */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon
            name={mode === 'time' ? 'access-time' : 'event'}
            size={24}
            color="#55A5AD"
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerLabel}>
            {mode === 'time'
              ? t('common.select_time')
              : t('common.select_date')}
          </Text>
          <Text style={styles.headerValue}>{getFormattedPreview()}</Text>
        </View>
      </View>

      {/* Quick select buttons - date mode only */}
      {mode === 'date' && (
        <View style={styles.quickSelectContainer}>
          <QuickSelectButton
            label={t('common.today')}
            icon="today"
            onPress={() => handleQuickSelect(0)}
            isSelected={moment(dateSelected).isSame(moment(), 'day')}
          />
          <QuickSelectButton
            label={t('common.tomorrow')}
            icon="event"
            onPress={() => handleQuickSelect(1)}
            isSelected={moment(dateSelected).isSame(
              moment().add(1, 'day'),
              'day'
            )}
          />
          <QuickSelectButton
            label={t('common.next_week')}
            icon="date-range"
            onPress={() => handleQuickSelect(7)}
            isSelected={false}
          />
        </View>
      )}

      {/* DateTimePicker - platform specific */}
      {renderDatePicker()}

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          styled="rounded"
          title={t('common.save')}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

// Quick select button component
const QuickSelectButton = ({ label, icon, onPress, isSelected }) => (
  <Pressable
    style={({ pressed }) => [
      styles.quickButton,
      isSelected && styles.quickButtonSelected,
      pressed && styles.quickButtonPressed
    ]}
    onPress={onPress}
  >
    <Icon name={icon} size={18} color={isSelected ? '#FFFFFF' : '#6B7280'} />
    <Text
      style={[
        styles.quickButtonText,
        isSelected && styles.quickButtonTextSelected
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  androidTrigger: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  androidTriggerPressed: {
    backgroundColor: '#F9FAFB'
  },
  androidTriggerText: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '600'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  container: {
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20
  },
  headerInfo: {
    flex: 1,
    gap: 4
  },
  headerLabel: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500'
  },
  headerValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700'
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  pickerContainerIOS: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 16,
    borderWidth: 1,
    height: 220,
    justifyContent: 'center',
    marginHorizontal: 20,
    overflow: 'hidden'
  },
  pickerIOS: {
    height: 200,
    width: '100%'
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12
  },
  quickButtonPressed: {
    backgroundColor: '#F9FAFB'
  },
  quickButtonSelected: {
    backgroundColor: '#55A5AD',
    borderColor: '#55A5AD'
  },
  quickButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600'
  },
  quickButtonTextSelected: {
    color: '#FFFFFF'
  },
  quickSelectContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 20
  }
});

export default DateSelector;
