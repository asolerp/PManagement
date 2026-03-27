import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import ProfileBar from '../../components/ProfileBar';
import PageLayout from '../../components/PageLayout';
import { OwnerChecks } from '../../components/Check/OwnerChecks';
import { Colors } from '../../Theme/Variables';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import { useOwnerDashboard } from './hooks/useOwnerDashboard';

const DEFAULT_HOUSE_IMAGE =
  'https://res.cloudinary.com/enalbis/image/upload/v1663600847/PortManagement/varios/w0n2hq4uhhgjdrlhlnns.jpg';

function formatChecklistDate(value) {
  if (!value) return '—';
  try {
    const date =
      value?.toDate ? value.toDate() : new Date(value?.seconds * 1000 ?? value);
    if (isNaN(date.getTime())) return '—';
    return format(date, "d 'de' MMMM yyyy", { locale: es });
  } catch {
    return '—';
  }
}

const INCIDENCE_STATE_LABELS = {
  initiate: 'Iniciada',
  process: 'En proceso',
  done: 'Resuelta'
};

const INCIDENCE_STATE_COLORS = {
  initiate: Colors.warning,
  process: Colors.primary,
  done: Colors.success
};

function IncidenceCard({ incidence }) {
  const state = incidence?.state || 'initiate';
  const color = INCIDENCE_STATE_COLORS[state] || Colors.warning;
  const label = INCIDENCE_STATE_LABELS[state] || state;

  return (
    <View style={styles.incidenceCard}>
      <View style={[styles.incidenceStateBar, { backgroundColor: color }]} />
      <View style={styles.incidenceContent}>
        <Text style={styles.incidenceTitle} numberOfLines={2}>
          {incidence?.title || 'Sin título'}
        </Text>
        {incidence?.incidence ? (
          <Text style={styles.incidenceDescription} numberOfLines={1}>
            {incidence.incidence}
          </Text>
        ) : null}
        <View style={[styles.incidenceBadge, { backgroundColor: color + '20' }]}>
          <View style={[styles.incidenceDot, { backgroundColor: color }]} />
          <Text style={[styles.incidenceBadgeText, { color }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={18} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}


const DashboardOwner = () => {
  const user = useSelector(userSelector);
  const { house, checklist, checks, incidences, loading } =
    useOwnerDashboard(user?.id);

  return (
    <PageLayout statusBar="light-content" withTitle={false} withPadding={false}>
      <ProfileBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Tarjeta de propiedad */}
            {house && (
              <View style={styles.section}>
                <SectionHeader icon="home" title="Tu propiedad" />
                <View style={styles.houseCard}>
                  <FastImage
                    source={{
                      uri: house?.houseImage?.original || DEFAULT_HOUSE_IMAGE,
                      priority: FastImage.priority.normal
                    }}
                    style={styles.houseImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.houseInfo}>
                    <Text style={styles.houseName}>
                      {house.houseName || '—'}
                    </Text>
                    {(house.street || house.address) && (
                      <View style={styles.houseAddressRow}>
                        <Icon name="location-on" size={13} color={Colors.gray400} />
                        <Text style={styles.houseAddress}>
                          {house.street || house.address}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Incidencias abiertas */}
            <View style={styles.section}>
              <SectionHeader icon="warning" title="Incidencias abiertas" />
              {incidences.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Icon name="check-circle" size={32} color={Colors.success} />
                  <Text style={styles.emptyTitle}>Todo en orden</Text>
                  <Text style={styles.emptySubtitle}>
                    No hay incidencias abiertas en tu propiedad.
                  </Text>
                </View>
              ) : (
                <View style={styles.incidenceList}>
                  {incidences.map(inc => (
                    <IncidenceCard key={inc.id} incidence={inc} />
                  ))}
                </View>
              )}
            </View>

            {/* Último informe de inspección */}
            <View style={styles.section}>
              <SectionHeader icon="assignment" title="Último informe" />
              {!checklist ? (
                <View style={styles.emptyCard}>
                  <Icon name="hourglass-empty" size={32} color={Colors.gray300} />
                  <Text style={styles.emptyTitle}>Sin informes aún</Text>
                  <Text style={styles.emptySubtitle}>
                    Aún no hay ningún informe de inspección registrado.
                  </Text>
                </View>
              ) : checklist.finished ? (
                <View style={styles.checklistCard}>
                  <View style={styles.checklistHeader}>
                    <View style={styles.checklistStatusBadge}>
                      <Icon name="check-circle" size={14} color={Colors.success} />
                      <Text style={styles.checklistStatusText}>Completado</Text>
                    </View>
                    <Text style={styles.checklistDate}>
                      {formatChecklistDate(checklist?.date)}
                    </Text>
                  </View>
                  {house?.street || house?.address ? (
                    <Text style={styles.checklistAddress}>
                      {house.street || house.address}
                    </Text>
                  ) : null}
                  <OwnerChecks
                    checklist={checklist}
                    checksFromChecklist={checks}
                  />
                </View>
              ) : (
                <View style={styles.checklistCard}>
                  <View style={styles.checklistHeader}>
                    <View style={[styles.checklistStatusBadge, styles.checklistInProgressBadge]}>
                      <Icon name="autorenew" size={14} color={Colors.primary} />
                      <Text style={[styles.checklistStatusText, styles.checklistInProgressText]}>
                        En curso
                      </Text>
                    </View>
                    <Text style={styles.checklistDate}>
                      {formatChecklistDate(checklist?.date)}
                    </Text>
                  </View>
                  <Text style={styles.checklistInProgressMessage}>
                    Estamos trabajando en tu propiedad. Te avisaremos cuando el
                    informe esté listo.
                  </Text>
                </View>
              )}
            </View>

          </>
        )}
      </ScrollView>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  checklistAddress: {
    color: Colors.gray500,
    fontSize: 13,
    marginBottom: 12,
    marginTop: 2
  },
  checklistCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray200,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16
  },
  checklistDate: {
    color: Colors.gray500,
    fontSize: 13
  },
  checklistHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  checklistInProgressBadge: {
    backgroundColor: Colors.primaryLow
  },
  checklistInProgressMessage: {
    color: Colors.gray600,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  checklistInProgressText: {
    color: Colors.primary
  },
  checklistStatusBadge: {
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  checklistStatusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600'
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  emptySubtitle: {
    color: Colors.gray400,
    fontSize: 13,
    textAlign: 'center'
  },
  emptyTitle: {
    color: Colors.gray600,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4
  },
  houseAddress: {
    color: Colors.gray500,
    fontSize: 13,
    marginLeft: 3
  },
  houseAddressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4
  },
  houseCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray200,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  houseImage: {
    height: 160,
    width: '100%'
  },
  houseInfo: {
    padding: 14
  },
  houseName: {
    color: Colors.gray900,
    fontSize: 17,
    fontWeight: '700'
  },
  incidenceBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  incidenceBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  incidenceCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray200,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  incidenceContent: {
    flex: 1,
    padding: 12
  },
  incidenceDescription: {
    color: Colors.gray500,
    fontSize: 13,
    marginTop: 2
  },
  incidenceDot: {
    borderRadius: 4,
    height: 7,
    width: 7
  },
  incidenceList: {
    gap: 8
  },
  incidenceStateBar: {
    width: 4
  },
  incidenceTitle: {
    color: Colors.gray800,
    fontSize: 14,
    fontWeight: '600'
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 32
  },
  section: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  sectionTitle: {
    color: Colors.gray800,
    fontSize: 16,
    fontWeight: '700'
  }
});

export default DashboardOwner;
