import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetGlobalStats } from './hooks/useGetGlobalStats';

export const GlobalStats = ({ onPressStat, uid }) => {
  const { checks, incidences } = useGetGlobalStats({ uid });

  return (
    <View style={styles.container}>
      {/* Checklists Card */}
      <Pressable
        onPress={() => onPressStat(0)}
        style={({ pressed }) => [
          styles.statCard,
          pressed && styles.statCardPressed
        ]}
      >
        <LinearGradient
          colors={['#55A5AD', '#3B8A91']}
          style={styles.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.iconContainer}>
          <Icon name="checklist" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.statContent}>
          <Text style={styles.statNumber}>{checks || 0}</Text>
          <Text style={styles.statLabel}>Checklists</Text>
        </View>

        <View style={styles.arrowContainer}>
          <Icon name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </Pressable>

      {/* Incidences Card */}
      <Pressable
        onPress={() => onPressStat(1)}
        style={({ pressed }) => [
          styles.statCard,
          pressed && styles.statCardPressed
        ]}
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.iconContainer}>
          <Icon name="warning" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.statContent}>
          <Text style={styles.statNumber}>{incidences || 0}</Text>
          <Text style={styles.statLabel}>Incidencias</Text>
        </View>

        <View style={styles.arrowContainer}>
          <Icon name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 16
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 4,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 64,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  statCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24
  }
});
