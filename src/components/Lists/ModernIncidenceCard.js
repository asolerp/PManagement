import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Configuración de colores para estados
const STATUS_COLORS = {
  iniciada: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    gradient: ['#3B82F6', '#2563EB'],
    icon: 'schedule'
  },
  proceso: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    gradient: ['#F59E0B', '#D97706'],
    icon: 'engineering'
  },
  finalizada: {
    primary: '#10B981',
    light: '#D1FAE5',
    gradient: ['#10B981', '#059669'],
    icon: 'check-circle'
  },
  cancelada: {
    primary: '#EF4444',
    light: '#FEE2E2',
    gradient: ['#EF4444', '#DC2626'],
    icon: 'cancel'
  }
};

const DATE_COLORS = {
  success: {
    primary: '#10B981',
    light: '#D1FAE5'
  },
  warning: {
    primary: '#F59E0B',
    light: '#FEF3C7'
  },
  danger: {
    primary: '#EF4444',
    light: '#FEE2E2'
  },
  pm: {
    primary: '#55A5AD',
    light: '#E0F2F4'
  }
};

export const ModernIncidenceCard = ({
  title,
  description,
  state = 'iniciada',
  house,
  workers = [],
  date,
  dateVariant = 'pm',
  unreadCount = 0,
  onPress
}) => {
  const statusInfo = STATUS_COLORS[state] || STATUS_COLORS.iniciada;
  const dateColor = DATE_COLORS[dateVariant] || DATE_COLORS.pm;
  const isDone = state === 'finalizada';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        isDone && styles.cardDone,
        pressed && styles.cardPressed
      ]}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={isDone ? ['#F0FDF4', '#FFFFFF'] : ['#FFFFFF', '#F9FAFB']}
        style={styles.gradientBg}
      />

      {/* Status Indicator Bar */}
      <View style={styles.statusIndicator}>
        <LinearGradient
          colors={statusInfo.gradient}
          style={[styles.statusFill, { width: '100%' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <View style={styles.cardContent}>
        {/* Header: Status Badge + Date */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={statusInfo.gradient}
            style={styles.statusBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name={statusInfo.icon} size={16} color="#FFFFFF" />
            <Text style={styles.statusBadgeText}>
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </Text>
          </LinearGradient>

          <View style={[styles.datePill, { borderColor: dateColor.primary }]}>
            <Icon name="event" size={12} color={dateColor.primary} />
            <Text style={[styles.datePillText, { color: dateColor.primary }]}>
              {date}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <View
            style={[styles.titleIconBg, { backgroundColor: statusInfo.light }]}
          >
            <Icon name="report-problem" size={18} color={statusInfo.primary} />
          </View>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* House */}
          {house && (
            <View style={styles.infoRow}>
              <View style={styles.iconBadge}>
                <Icon name="home" size={16} color="#6B7280" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {house}
              </Text>
            </View>
          )}

          {/* Workers */}
          {workers && workers.length > 0 && (
            <View style={styles.infoRow}>
              <View style={styles.iconBadge}>
                <Icon name="person" size={16} color="#6B7280" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {workers.length === 1
                  ? workers[0].firstName || workers[0].name
                  : `${workers[0].firstName || workers[0].name} +${workers.length - 1}`}
              </Text>
            </View>
          )}

          {/* Description */}
          {description && description.trim() !== '' && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={3}>
                {description}
              </Text>
            </View>
          )}
        </View>

        {/* Unread Messages Badge */}
        {unreadCount > 0 && (
          <View style={styles.unreadBadgeContainer}>
            <View style={styles.unreadBadge}>
              <Icon name="chat-bubble" size={14} color="#EF4444" />
              <Text style={styles.unreadText}>{unreadCount} nuevos</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    marginHorizontal: 4,
    maxWidth: 380,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      height: 1,
      width: 0
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: '100%'
  },
  cardContent: {
    padding: 12
  },
  cardDone: {
    borderColor: '#D1FAE5',
    borderWidth: 1
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  content: {
    marginTop: 12
  },
  datePill: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    borderLeftColor: '#D1D5DB',
    borderLeftWidth: 3,
    borderRadius: 8,
    marginTop: 4,
    padding: 10
  },
  descriptionText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  infoText: {
    color: '#4B5563',
    flex: 1,
    fontSize: 14
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  statusFill: {
    height: '100%'
  },
  statusIndicator: {
    backgroundColor: '#F3F4F6',
    height: 3,
    overflow: 'hidden',
    width: '100%'
  },
  titleIconBg: {
    alignItems: 'center',
    borderRadius: 8,
    height: 26,
    justifyContent: 'center',
    width: 26
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  titleText: {
    color: '#1F2937',
    flex: 1,
    fontSize: 18,
    fontWeight: '700'
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  unreadBadgeContainer: {
    alignItems: 'flex-start',
    marginTop: 12
  },
  unreadText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default ModernIncidenceCard;
