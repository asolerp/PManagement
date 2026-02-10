import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../Avatar';

// Configuración de colores para estados
const STATUS_COLORS = {
  success: {
    primary: '#10B981',
    light: '#D1FAE5',
    gradient: ['#10B981', '#059669']
  },
  warning: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    gradient: ['#F59E0B', '#D97706']
  },
  danger: {
    primary: '#EF4444',
    light: '#FEE2E2',
    gradient: ['#EF4444', '#DC2626']
  },
  pm: {
    primary: '#55A5AD',
    light: '#E0F2F4',
    gradient: ['#55A5AD', '#3B8A91']
  },
  purple: {
    primary: '#8B5CF6',
    light: '#EDE9FE',
    gradient: ['#8B5CF6', '#7C3AED']
  }
};

// Componente para cards de checklist activos (no finalizados)
export const ActiveChecklistCard = ({
  date,
  dateVariant = 'pm',
  house,
  workers = [],
  startHour,
  endHour,
  subtitle,
  done = 0,
  total = 0,
  onPress
}) => {
  const validDone = Math.max(0, done);
  const validTotal = Math.max(0, total);
  const progressPercentage =
    validTotal > 0 ? (validDone / validTotal) * 100 : 0;

  // Determinar color de progreso basado en porcentaje
  let progressStatus = 'danger';
  if (progressPercentage >= 75) progressStatus = 'success';
  else if (progressPercentage >= 40) progressStatus = 'warning';

  const statusColor = STATUS_COLORS[progressStatus];
  const dateColor = STATUS_COLORS[dateVariant] || STATUS_COLORS.pm;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed
      ]}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.gradientBg}
      />

      {/* Progress Indicator Bar */}
      <View style={styles.progressIndicator}>
        <LinearGradient
          colors={statusColor.gradient}
          style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <View style={styles.cardContent}>
        {/* Header: Progress Badge + Date */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={statusColor.gradient}
            style={styles.progressBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="format-list-bulleted" size={16} color="#FFFFFF" />
            <Text style={styles.progressBadgeText}>
              {validDone}/{validTotal}
            </Text>
          </LinearGradient>

          <View style={[styles.datePill, { borderColor: dateColor.primary }]}>
            <Icon name="event" size={12} color={dateColor.primary} />
            <Text style={[styles.datePillText, { color: dateColor.primary }]}>
              {date}
            </Text>
          </View>
        </View>

        {/* House + Workers */}
        <View style={styles.metaStrip}>
          <View style={styles.chipHouse}>
            <Icon name="home" size={13} color={STATUS_COLORS.purple.primary} />
            <Text style={styles.chipHouseText} numberOfLines={1}>
              {house}
            </Text>
          </View>
          {workers && workers.length > 0 && (
            <>
              <View style={styles.metaDot} />
              <View style={styles.chipWorker}>
                <View style={styles.workersAvatars}>
                  {workers.slice(0, 3).map((worker, i) => (
                    <Avatar
                      key={worker.id}
                      overlap={workers.length > 1}
                      index={i}
                      id={worker.id}
                      uri={worker.profileImage?.small}
                      size="tiny"
                    />
                  ))}
                </View>
                <Text style={styles.chipWorkerText} numberOfLines={1}>
                  {workers.length === 1
                    ? workers[0].firstName || workers[0].name
                    : `${workers[0].firstName || workers[0].name} +${workers.length - 1}`}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Content - solo si hay hora o notas */}
        {((startHour && endHour) || (subtitle && subtitle.trim() !== '')) && (
          <View style={styles.activeContent}>
            {startHour && endHour && (
              <View style={styles.activeInfoRow}>
                <View style={styles.iconBadge}>
                  <Icon name="access-time" size={16} color="#6B7280" />
                </View>
                <Text style={styles.activeInfoText}>
                  {startHour} - {endHour}
                </Text>
              </View>
            )}
            {subtitle && subtitle.trim() !== '' && (
              <View style={styles.activeNotesContainer}>
                <Text style={styles.activeNotes} numberOfLines={3}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

// Componente para cards de checklist finalizados
export const FinishedChecklistCard = ({
  date,
  dateVariant = 'pm',
  house,
  workers = [],
  startHour,
  endHour,
  subtitle,
  emailSent = false,
  onPress
}) => {
  const dateColor = STATUS_COLORS[dateVariant] || STATUS_COLORS.pm;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        styles.finishedCard,
        pressed && styles.cardPressed
      ]}
    >
      {/* Success Gradient Background */}
      <LinearGradient
        colors={['#F0FDF4', '#FFFFFF']}
        style={styles.gradientBg}
      />

      {/* Success Indicator */}
      <View style={[styles.progressIndicator, styles.finishedIndicator]}>
        <LinearGradient
          colors={STATUS_COLORS.success.gradient}
          style={[styles.progressFill, { width: '100%' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={STATUS_COLORS.success.gradient}
            style={styles.finishedBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="check-circle" size={16} color="#FFFFFF" />
            <Text style={styles.finishedBadgeText}>Finalizado</Text>
          </LinearGradient>

          <View style={[styles.datePill, { borderColor: dateColor.primary }]}>
            <Icon name="event" size={12} color={dateColor.primary} />
            <Text style={[styles.datePillText, { color: dateColor.primary }]}>
              {date}
            </Text>
          </View>
        </View>

        {/* House + Workers */}
        <View style={styles.metaStrip}>
          <View style={styles.chipHouse}>
            <Icon name="home" size={13} color={STATUS_COLORS.purple.primary} />
            <Text style={styles.chipHouseText} numberOfLines={1}>
              {house}
            </Text>
          </View>
          {workers && workers.length > 0 && (
            <>
              <View style={styles.metaDot} />
              <View style={styles.chipWorker}>
                <View style={styles.workersAvatars}>
                  {workers.slice(0, 3).map((worker, i) => (
                    <Avatar
                      key={worker.id}
                      overlap={workers.length > 1}
                      index={i}
                      id={worker.id}
                      uri={worker.profileImage?.small}
                      size="tiny"
                    />
                  ))}
                </View>
                <Text style={styles.chipWorkerText} numberOfLines={1}>
                  {workers
                    .map(w => w.firstName || w.name)
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Content - solo si hay hora o notas */}
        {((startHour && endHour) || (subtitle && subtitle.trim() !== '')) && (
          <View style={styles.finishedContent}>
            {startHour && endHour && (
              <View style={styles.finishedInfoRow}>
                <View style={styles.iconBadge}>
                  <Icon name="access-time" size={16} color="#6B7280" />
                </View>
                <Text style={styles.finishedInfoText}>
                  {startHour} - {endHour}
                </Text>
              </View>
            )}
            {subtitle && subtitle.trim() !== '' && (
              <View style={styles.finishedNotesContainer}>
                <Text style={styles.finishedNotes} numberOfLines={3}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Email Status */}
        <View style={styles.emailStatusContainer}>
          <View
            style={[
              styles.emailStatusBadge,
              emailSent
                ? { backgroundColor: STATUS_COLORS.success.light }
                : { backgroundColor: STATUS_COLORS.warning.light }
            ]}
          >
            <Icon
              name={emailSent ? 'email' : 'schedule-send'}
              size={14}
              color={
                emailSent
                  ? STATUS_COLORS.success.primary
                  : STATUS_COLORS.warning.primary
              }
            />
            <Text
              style={[
                styles.emailStatusText,
                {
                  color: emailSent
                    ? STATUS_COLORS.success.primary
                    : STATUS_COLORS.warning.primary
                }
              ]}
            >
              {emailSent ? 'Email enviado' : 'Pendiente de envío'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  activeContent: {
    marginTop: 6
  },
  activeHouseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  activeHouseText: {
    color: '#8B5CF6',
    flex: 1,
    fontSize: 18,
    fontWeight: '700'
  },
  activeInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  activeInfoText: {
    color: '#4B5563',
    flex: 1,
    fontSize: 14
  },
  activeNotes: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18
  },
  activeNotesContainer: {
    backgroundColor: '#F9FAFB',
    borderLeftColor: '#D1D5DB',
    borderLeftWidth: 3,
    borderRadius: 8,
    marginTop: 4,
    padding: 10
  },
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
    paddingBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 12
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  chipHouse: {
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 5,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  chipHouseText: {
    color: '#7C3AED',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700'
  },
  chipWorker: {
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  chipWorkerText: {
    color: '#1E40AF',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600'
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
  emailStatusBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  emailStatusContainer: {
    alignItems: 'flex-start',
    marginTop: 12
  },
  emailStatusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  finishedBadge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  finishedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  finishedCard: {
    borderColor: '#D1FAE5',
    borderWidth: 1
  },
  finishedContent: {
    marginTop: 6
  },
  finishedHouseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  finishedHouseText: {
    color: '#8B5CF6',
    flex: 1,
    fontSize: 18,
    fontWeight: '700'
  },
  finishedIndicator: {
    height: 4
  },
  finishedInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  finishedInfoText: {
    color: '#4B5563',
    flex: 1,
    fontSize: 14
  },
  finishedNotes: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18
  },
  finishedNotesContainer: {
    backgroundColor: '#F9FAFB',
    borderLeftColor: '#D1D5DB',
    borderLeftWidth: 3,
    borderRadius: 8,
    marginTop: 4,
    padding: 10
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
  houseIconBg: {
    alignItems: 'center',
    borderRadius: 8,
    height: 26,
    justifyContent: 'center',
    width: 26
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  metaDot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    height: 4,
    width: 4
  },
  metaStrip: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  progressBadge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  progressFill: {
    height: '100%'
  },
  progressIndicator: {
    backgroundColor: '#F3F4F6',
    height: 3,
    overflow: 'hidden',
    width: '100%'
  },
  statusDot: {
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 12,
    top: 12,
    width: 10
  },
  workersAvatars: {
    flexDirection: 'row'
  }
});
