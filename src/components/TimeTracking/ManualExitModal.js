import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomModal } from '../BottomModal';
import { Colors } from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const ManualExitModal = ({ isVisible, onClose, onConfirm, loading }) => {
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());

  const handleConfirm = () => {
    onConfirm({ hours, minutes });
  };

  const adjustTime = (type, delta) => {
    if (type === 'hours') {
      const newHours = (hours + delta + 24) % 24;
      setHours(newHours);
    } else {
      const newMinutes = (minutes + delta + 60) % 60;
      // Redondear al múltiplo de 5 más cercano
      const rounded = Math.round(newMinutes / 5) * 5;
      setMinutes(rounded >= 60 ? 0 : rounded);
    }
  };

  return (
    <BottomModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      ctaText="Marcar salida"
      onCTA={handleConfirm}
      disabled={loading}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Marcar salida manualmente</Text>
        <Text style={styles.subtitle}>
          Selecciona la hora de salida del trabajador
        </Text>

        <View style={styles.timeSelectorContainer}>
          <View style={styles.timeSelector}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => adjustTime('hours', 1)}
              activeOpacity={0.7}
            >
              <Icon name="keyboard-arrow-up" size={32} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Hora</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.timeValue}>
                  {String(hours).padStart(2, '0')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => adjustTime('hours', -1)}
              activeOpacity={0.7}
            >
              <Icon name="keyboard-arrow-down" size={32} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.timeSelector}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => adjustTime('minutes', 5)}
              activeOpacity={0.7}
            >
              <Icon name="keyboard-arrow-up" size={32} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Min</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.timeValue}>
                  {String(minutes).padStart(2, '0')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => adjustTime('minutes', -5)}
              activeOpacity={0.7}
            >
              <Icon name="keyboard-arrow-down" size={32} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.currentTimeDisplay}>
          <Icon name="access-time" size={16} color={Colors.gray600} />
          <Text style={styles.currentTimeText}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
          </Text>
        </View>

        <Text style={styles.note}>
          * Esta salida será marcada como registrada manualmente por el owner
        </Text>
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  currentTimeDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 16
  },
  currentTimeText: {
    color: Colors.gray900,
    fontSize: 18,
    fontWeight: '600'
  },
  note: {
    color: Colors.gray500,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center'
  },
  separator: {
    color: Colors.gray900,
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 8
  },
  subtitle: {
    color: Colors.gray600,
    fontSize: 14,
    marginBottom: 20,
    marginTop: 4,
    textAlign: 'center'
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeLabel: {
    color: Colors.gray700,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  timeSelector: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center'
  },
  timeSelectorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8
  },
  timeValue: {
    color: Colors.gray900,
    fontSize: 36,
    fontWeight: 'bold'
  },
  title: {
    color: Colors.gray900,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  valueContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    marginTop: 8,
    width: 80
  }
});
