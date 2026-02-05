import { useRoute } from '@react-navigation/core';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// UI
import Avatar from '../Avatar';
import EditableInput from '../Elements/EditableInput';
import DynamicSelectorList from '../DynamicSelectorList';
import { BottomModal } from '../Modals/BottomModal';

// Firebase
import { getFirestore, doc } from '@react-native-firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

// Services
import updateIncidenceInput from '../../Services/updateIncidenceInput';
import { asignWorkerToIncidence } from '../../Services/asignWorkerToIncidence';

// Utils
import { openScreenWithPush } from '../../Router/utils/actions';
import { HOUSE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { useTranslation } from 'react-i18next';
import useAuth from '../../utils/useAuth';
import { DEFAULT_IMAGE } from '../../constants/general';

// Componente para el header con casa, fecha y estado
const IncidenceHeader = ({ incidence, onHousePress, t }) => {
  const date = incidence?.date?.toDate?.();
  const isDone = incidence?.done;

  return (
    <View style={styles.headerSection}>
      {isDone && (
        <View style={styles.finishedBadge}>
          <Icon name="check-circle" size={16} color="#10B981" />
          <Text style={styles.finishedText}>{t('common.resolved')}</Text>
        </View>
      )}

      <Pressable style={styles.houseCard} onPress={onHousePress}>
        <View style={styles.houseCardContent}>
          <Icon name="home" size={20} color="#8B5CF6" />
          <View style={styles.houseInfo}>
            <Text style={styles.houseLabel}>Propiedad</Text>
            <Text style={styles.houseName}>{incidence?.house?.houseName}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#CBD5E0" />
      </Pressable>

      <View style={styles.dateCard}>
        <Icon name="event" size={18} color="#55A5AD" />
        <View>
          <Text style={styles.dateLabel}>Fecha de registro</Text>
          <Text style={styles.dateText}>{moment(date).format('LL')}</Text>
        </View>
      </View>

      {!isDone && (
        <View style={styles.statusCard}>
          <Icon name="warning" size={18} color="#EF4444" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Estado</Text>
            <Text style={styles.statusText}>{t('common.no_resolved')}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Componente para el título de la incidencia
const IncidenceTitleSection = ({ title }) => (
  <View style={styles.titleSection}>
    <View style={styles.titleHeader}>
      <View style={styles.iconContainer}>
        <Icon name="report-problem" size={18} color="#F59E0B" />
      </View>
      <View style={styles.titleContent}>
        <Text style={styles.titleLabel}>Incidencia</Text>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    </View>
  </View>
);

// Componente para la descripción
const DescriptionSection = ({ isOwner, incidence, incidenceId, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.iconContainer}>
          <Icon name="description" size={18} color="#55A5AD" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.sectionSubtitle}>
            {isOwner
              ? 'Detalles de la incidencia reportada'
              : 'Describe el problema encontrado'}
          </Text>
        </View>
      </View>
    </View>

    {isOwner ? (
      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>
          {incidence?.incidence || 'Sin descripción'}
        </Text>
      </View>
    ) : (
      <EditableInput
        value={incidence?.incidence || ''}
        placeholder="Describe el problema, causas posibles, ubicación..."
        onPressAccept={change =>
          updateIncidenceInput(incidenceId, { incidence: change })
        }
      />
    )}
  </View>
);

// Componente para los trabajadores
const WorkersSection = ({ workers, isOwner, onAddWorker, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.iconContainer}>
          <Icon name="people" size={18} color="#55A5AD" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>
            {isOwner ? 'Trabajadores asignados' : t('common.asigned_to')}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {workers?.length > 0
              ? `${workers.length} ${workers.length === 1 ? 'trabajador asignado' : 'trabajadores asignados'}`
              : 'Sin trabajadores asignados'}
          </Text>
        </View>
      </View>
      {!isOwner && (
        <Pressable style={styles.addButton} onPress={onAddWorker}>
          <Icon name="person-add" size={20} color="#55A5AD" />
        </Pressable>
      )}
    </View>

    {workers?.length > 0 ? (
      <View style={styles.workersGrid}>
        {workers.map((worker, i) => (
          <View key={worker.id || i} style={styles.workerCard}>
            <Avatar
              enabled={!isOwner}
              overlap={false}
              index={i}
              id={worker.id}
              uri={worker.profileImage?.small || DEFAULT_IMAGE}
              size="big"
              showName={false}
            />
            <Text style={styles.workerName} numberOfLines={1}>
              {worker.firstName}
            </Text>
            {worker.lastName && (
              <Text style={styles.workerLastName} numberOfLines={1}>
                {worker.lastName}
              </Text>
            )}
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.emptyWorkersCard}>
        <Icon name="person-off" size={32} color="#CBD5E0" />
        <Text style={styles.emptyWorkersText}>
          {isOwner
            ? 'Aún no se han asignado trabajadores'
            : 'Presiona + para asignar trabajadores'}
        </Text>
      </View>
    )}
  </View>
);

// Componente para el reportador
const ReporterSection = ({ reporter, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.iconContainer}>
          <Icon name="person" size={18} color="#55A5AD" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>{t('common.informer')}</Text>
          <Text style={styles.sectionSubtitle}>
            Persona que reportó la incidencia
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.reporterCard}>
      <Avatar uri={reporter?.profileImage?.small || DEFAULT_IMAGE} size="big" />
      <View style={styles.reporterInfo}>
        <Text style={styles.reporterName}>
          {reporter?.firstName} {reporter?.lastName}
        </Text>
        <Text style={styles.reporterRole}>
          {reporter?.role === 'admin' ? 'Administrador' : 'Trabajador'}
        </Text>
      </View>
    </View>
  </View>
);

const Info = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { isOwner } = useAuth();
  const { incidenceId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [workers, setWorkers] = useState();

  const db = getFirestore();
  const incidenceRef = doc(db, 'incidences', incidenceId);

  const [value, loading] = useDocument(incidenceRef, {
    snapshotListenOptions: { includeMetadataChanges: true }
  });

  const incidence = value?.data();
  const asignedUsers = workers || incidence?.workers;

  const handleAsignWorker = async asignedWorkers => {
    await asignWorkerToIncidence(incidenceId, {
      workers: asignedWorkers,
      workersId: asignedWorkers?.map(worker => worker.uid || worker.id)
    });
    setModalVisible(false);
  };

  const handleHousePress = () => {
    if (incidence?.house?.id) {
      openScreenWithPush(HOUSE_SCREEN_KEY, {
        houseId: incidence.house.id
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando incidencia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        swipeDirection={null}
      >
        <DynamicSelectorList
          collection="users"
          store="jobForm"
          where={[
            {
              label: 'role',
              operator: '==',
              condition: 'worker'
            }
          ]}
          searchBy="firstName"
          schema={{ img: 'profileImage', name: 'firstName' }}
          get={asignedUsers}
          set={workers => setWorkers(workers)}
          onSave={handleAsignWorker}
          multiple={true}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>

      {/* Header con casa, fecha y estado */}
      {incidence && (
        <IncidenceHeader
          incidence={incidence}
          onHousePress={handleHousePress}
          t={t}
        />
      )}

      {/* Título de la incidencia */}
      {incidence?.title && <IncidenceTitleSection title={incidence.title} />}

      {/* Descripción */}
      {incidence && (
        <DescriptionSection
          isOwner={isOwner}
          incidence={incidence}
          incidenceId={incidenceId}
          t={t}
        />
      )}

      {/* Trabajadores */}
      <WorkersSection
        workers={asignedUsers}
        isOwner={isOwner}
        onAddWorker={() => setModalVisible(true)}
        t={t}
      />

      {/* Reportador */}
      {incidence?.user && <ReporterSection reporter={incidence.user} t={t} />}
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  container: {
    flex: 1
  },
  dateCard: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  dateLabel: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  dateText: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '700'
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16
  },
  descriptionText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 22
  },
  emptyWorkersCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 8,
    paddingVertical: 32
  },
  emptyWorkersText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  finishedBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  finishedText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700'
  },
  headerSection: {
    gap: 12,
    marginBottom: 20
  },
  houseCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12
  },
  houseCardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  houseInfo: {
    flex: 1
  },
  houseLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  houseName: {
    color: '#8B5CF6',
    fontSize: 15,
    fontWeight: '700'
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 50
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14
  },
  reporterCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16
  },
  reporterInfo: {
    flex: 1
  },
  reporterName: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2
  },
  reporterRole: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500'
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionHeaderLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  statusInfo: {
    flex: 1
  },
  statusLabel: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  statusText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700'
  },
  titleContent: {
    flex: 1
  },
  titleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  titleLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  titleSection: {
    marginBottom: 20
  },
  titleText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24
  },
  workerCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: 100
  },
  workerLastName: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center'
  },
  workerName: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  workersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  }
});

export default Info;
