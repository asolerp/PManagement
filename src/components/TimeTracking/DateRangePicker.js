import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Animated
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors } from '../../Theme/Variables';

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onToday,
  onThisWeek,
  onThisMonth
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const formatDate = date => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      if (selectedDate) {
        onStartDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempStartDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
      if (selectedDate) {
        onEndDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempEndDate(selectedDate);
      }
    }
  };

  const confirmStartDate = () => {
    onStartDateChange(tempStartDate);
    setShowStartPicker(false);
  };

  const confirmEndDate = () => {
    onEndDateChange(tempEndDate);
    setShowEndPicker(false);
  };

  const cancelStartPicker = () => {
    setTempStartDate(startDate);
    setShowStartPicker(false);
  };

  const cancelEndPicker = () => {
    setTempEndDate(endDate);
    setShowEndPicker(false);
  };

  const openStartPicker = () => {
    setTempStartDate(startDate);
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setTempEndDate(endDate);
    setShowEndPicker(true);
  };

  const renderIOSDatePicker = (
    isVisible,
    date,
    onChange,
    onConfirm,
    onCancel,
    minimumDate,
    maximumDate,
    title
  ) => {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
      if (isVisible) {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true
          })
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true
          })
        ]).start();
      }
    }, [isVisible, backdropOpacity, slideAnim]);

    if (!isVisible) return null;

    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        onRequestClose={onCancel}
        statusBarTranslucent
      >
        <View style={styles.dateModalOverlay}>
          <Animated.View
            style={[styles.dateModalBackdrop, { opacity: backdropOpacity }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={onCancel}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.dateModalContentWrapper,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.dateModalTitle}>{title}</Text>
                <TouchableOpacity
                  onPress={onConfirm}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  textColor={Colors.gray900}
                  locale="es-ES"
                  style={styles.datePickerStyle}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Quick Preset Buttons */}
      <View style={styles.presetContainer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={onToday}
          activeOpacity={0.7}
        >
          <Icon name="today" size={16} color={Colors.pm} />
          <Text style={styles.presetButtonText}>Hoy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={onThisWeek}
          activeOpacity={0.7}
        >
          <Icon name="date-range" size={16} color={Colors.pm} />
          <Text style={styles.presetButtonText}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={onThisMonth}
          activeOpacity={0.7}
        >
          <Icon name="calendar-month" size={16} color={Colors.pm} />
          <Text style={styles.presetButtonText}>Mes</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Range */}
      <View style={styles.customDateSection}>
        <Text style={styles.sectionLabel}>Rango personalizado</Text>
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={openStartPicker}
            activeOpacity={0.7}
          >
            <View style={styles.dateButtonContent}>
              <View>
                <Text style={styles.dateLabel}>Desde</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
              <Icon name="calendar-today" size={20} color={Colors.pm} />
            </View>
          </TouchableOpacity>

          <View style={styles.dateSeparator}>
            <Icon name="arrow-forward" size={20} color={Colors.gray400} />
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={openEndPicker}
            activeOpacity={0.7}
          >
            <View style={styles.dateButtonContent}>
              <View>
                <Text style={styles.dateLabel}>Hasta</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
              <Icon name="calendar-today" size={20} color={Colors.pm} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pickers */}
      {Platform.OS === 'ios' ? (
        <>
          {renderIOSDatePicker(
            showStartPicker,
            tempStartDate,
            handleStartDateChange,
            confirmStartDate,
            cancelStartPicker,
            null,
            endDate,
            'Seleccionar fecha de inicio'
          )}
          {renderIOSDatePicker(
            showEndPicker,
            tempEndDate,
            handleEndDateChange,
            confirmEndDate,
            cancelEndPicker,
            startDate,
            null,
            'Seleccionar fecha de fin'
          )}
        </>
      ) : (
        <>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              maximumDate={endDate}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  customDateSection: {
    marginTop: 16
  },
  dateButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 12
  },
  dateButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateLabel: {
    color: Colors.gray600,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  dateModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dateModalContent: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: '100%'
  },
  dateModalContentWrapper: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    width: '100%'
  },
  dateModalHeader: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderBottomColor: Colors.grey,
    borderBottomWidth: 0.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  dateModalTitle: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  datePickerContainer: {
    backgroundColor: Colors.white,
    height: 260,
    width: '100%'
  },
  datePickerStyle: {
    height: 260,
    width: '100%'
  },
  dateRangeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  dateSeparator: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateValue: {
    color: Colors.gray900,
    fontSize: 14,
    fontWeight: '600'
  },
  modalCancelButton: {
    paddingVertical: 8,
    width: 80
  },
  modalCancelText: {
    color: Colors.pm,
    fontSize: 16
  },
  modalConfirmButton: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    width: 80
  },
  modalConfirmText: {
    color: Colors.pm,
    fontSize: 16,
    fontWeight: '600'
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  presetButtonText: {
    color: Colors.gray700,
    fontSize: 13,
    fontWeight: '600'
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 8
  },
  sectionLabel: {
    color: Colors.gray700,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12
  }
});
