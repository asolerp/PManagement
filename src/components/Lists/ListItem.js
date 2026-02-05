import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../Avatar';

const FULL_WIDTH = '100%';
const CARD_WIDTH = 220;

// Helper para obtener el color según el porcentaje de completado
const getStatusColor = statusColor => {
  // statusColor ya viene como color hex desde parsePercentageDone
  return statusColor || '#55A5AD';
};

// Helper para obtener el color del badge de fecha
const getDateVariantColor = variant => {
  const colors = {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    pm: '#55A5AD',
    purple: '#8B5CF6'
  };
  return colors[variant] || colors.pm;
};

export const ListItem = ({
  date,
  title,
  house,
  workers,
  endHour,
  subtitle,
  startHour,
  dateVariant,
  fullWidth = false,
  statusColor = '#55A5AD',
  done,
  total
}) => {
  const dateColor = getDateVariantColor(dateVariant);
  const progressColor = getStatusColor(statusColor);

  // Validar y normalizar valores
  const validDone = Math.max(0, done || 0); // Asegurar que nunca sea negativo
  const validTotal = Math.max(0, total || 0);

  // Log para debug si hay valores negativos
  if (done < 0) {
    console.warn(
      `⚠️ ListItem: done es negativo (${done}/${total}). Normalizando a 0.`
    );
  }

  // Calcular progreso
  const progressPercentage =
    validTotal > 0 ? (validDone / validTotal) * 100 : 0;
  const progressText = `${validDone}/${validTotal}`;

  return (
    <View
      style={[
        styles.container,
        {
          width: fullWidth ? FULL_WIDTH : CARD_WIDTH
        }
      ]}
    >
      <View style={styles.content}>
        {/* Top Row: Casa (izq) + Fecha (der) */}
        <View style={styles.topRow}>
          <View style={styles.houseRow}>
            <Icon name="home" size={11} color="#8B5CF6" />
            <Text style={styles.houseText} numberOfLines={1}>
              {house}
            </Text>
          </View>

          <View
            style={[
              styles.datePill,
              { backgroundColor: `${dateColor}20`, borderColor: dateColor }
            ]}
          >
            <Text style={[styles.dateText, { color: dateColor }]}>{date}</Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: progressColor }]}>
            {progressText}
          </Text>
        </View>

        {/* Info Row: Trabajadores */}
        <View style={styles.infoRow}>
          {/* Trabajadores */}
          {workers && workers.length > 0 && (
            <View style={styles.workersCompact}>
              <Icon name="people" size={11} color="#6B7280" />
              <View style={styles.avatarStack}>
                {workers.slice(0, 3).map((worker, index) => (
                  <View
                    key={worker.id || index}
                    style={[styles.miniAvatar, index > 0 && { marginLeft: -4 }]}
                  >
                    <Avatar
                      uri={worker.profileImage?.small}
                      name={
                        worker.firstName || worker.name || worker.displayName
                      }
                      size="tiny"
                      showName={false}
                    />
                  </View>
                ))}
                {workers.length > 3 && (
                  <Text style={styles.workerCount}>+{workers.length - 3}</Text>
                )}
              </View>
              <Text style={styles.workerCountTotal}>({workers.length})</Text>
            </View>
          )}

          {/* Horarios si existen */}
          {startHour && endHour && (
            <View style={styles.timeCompact}>
              <Icon name="schedule" size={11} color="#6B7280" />
              <Text style={styles.timeText}>
                {startHour}-{endHour}
              </Text>
            </View>
          )}
        </View>

        {/* Observaciones si existen */}
        {subtitle && subtitle.trim() !== '' && (
          <Text style={styles.notes} numberOfLines={1}>
            💬 {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarStack: {
    flexDirection: 'row',
    marginLeft: 2
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    overflow: 'hidden'
  },
  content: {
    padding: 10
  },
  // Date Pill
  datePill: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700'
  },
  houseRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: 8
  },
  houseText: {
    color: '#8B5CF6',
    flex: 1,
    fontSize: 11,
    fontWeight: '600'
  },
  // Info Row
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  miniAvatar: {
    borderColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 1
  },
  // Notes
  notes: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 6
  },
  // Progress Section
  progressBar: {
    borderRadius: 3,
    height: '100%'
  },
  progressBarContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: 'hidden'
  },
  progressSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    marginTop: 8
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700'
  },
  // Time Compact
  timeCompact: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3
  },
  timeText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '500'
  },
  title: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 6
  },
  // Top Row
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  workerCount: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 2
  },
  workerCountTotal: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2
  },
  // Workers Compact
  workersCompact: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 3
  }
});
