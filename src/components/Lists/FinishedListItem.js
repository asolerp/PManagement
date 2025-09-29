import React from 'react';

import { Text, View, StyleSheet } from 'react-native';
// import { useTheme } from '../../Theme';
import { Colors } from '../../Theme/Variables';
import Badge from '../Elements/Badge';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const FinishedListItem = ({
  date,
  title,
  house,
  startHour,
  endHour,
  dateVariant,
  emailSent,
  workers,
  subtitle
}) => {
  // const { Layout, Gutters, Fonts } = useTheme();

  const getEmailStatus = () => {
    if (emailSent) {
      return {
        text: 'Enviado',
        variant: 'success',
        icon: 'email',
        color: Colors.success
      };
    }
    return {
      text: 'Pendiente',
      variant: 'warning',
      icon: 'schedule',
      color: Colors.warning
    };
  };

  const emailStatus = getEmailStatus();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Badge type="outline" text="✓ Finalizado" variant="success" />
        <Badge
          text={date}
          variant={dateVariant || 'pm'}
          type="outline"
          iconName="schedule"
        />
      </View>

      {/* House Section */}
      <View style={styles.houseSection}>
        <Icon name="home" size={18} color={Colors.purple} />
        <Text style={styles.houseText}>{house}</Text>
      </View>

      {/* Title Section */}
      {title && (
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
      )}

      {/* Subtitle/Observations */}
      {subtitle && (
        <View style={styles.subtitleSection}>
          <Text style={styles.subtitle} numberOfLines={3} ellipsizeMode="tail">
            {subtitle}
          </Text>
        </View>
      )}

      {/* Time Section */}
      {startHour && endHour && (
        <View style={styles.timeSection}>
          <Icon name="schedule" size={16} color={Colors.gray600} />
          <Text style={styles.timeText}>
            {startHour} - {endHour}
          </Text>
        </View>
      )}

      {/* Workers Section */}
      {workers && workers.length > 0 && (
        <View style={styles.workersSection}>
          <Icon name="people" size={16} color={Colors.gray600} />
          <Text style={styles.workersText}>
            {workers.map(w => w.firstName).join(', ')}
          </Text>
        </View>
      )}

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Email Status */}
        <View style={styles.emailStatus}>
          <Icon name={emailStatus.icon} size={16} color={emailStatus.color} />
          <Text style={[styles.emailText, { color: emailStatus.color }]}>
            {emailStatus.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray300,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 12,
    marginRight: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      height: 2,
      width: 0
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%'
  },

  emailStatus: {
    alignItems: 'center',
    flexDirection: 'row'
  },

  emailText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },

  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },

  houseSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12
  },

  houseText: {
    color: Colors.purple,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },

  subtitle: {
    color: Colors.gray600,
    fontSize: 14,
    lineHeight: 20
  },

  subtitleSection: {
    marginBottom: 12
  },

  timeSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8
  },

  timeText: {
    color: Colors.gray600,
    fontSize: 14,
    marginLeft: 6
  },

  title: {
    color: Colors.gray900,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24
  },

  titleSection: {
    marginBottom: 8
  },

  workersSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12
  },

  workersText: {
    color: Colors.gray600,
    fontSize: 14,
    marginLeft: 6
  }
});
