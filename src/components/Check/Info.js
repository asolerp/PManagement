import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import {
  useCollectionData,
  useDocumentData
} from 'react-firebase-hooks/firestore';

import moment from 'moment';

import EditableInput from '../Elements/EditableInput';

import { useRoute } from '@react-navigation/core';
import updateChecklistInput from '../../Services/updateChecklistInput';

import ListOfChecks from './ListOfChecks';
import { CHECKLISTS } from '../../utils/firebaseKeys';

import Avatar from '../Avatar';

import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { openScreenWithPush } from '../../Router/utils/actions';
import { HOUSE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import useAuth from '../../utils/useAuth';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { DEFAULT_IMAGE } from '../../constants/general';

// Componente para el header con la casa y fecha
const ChecklistHeader = ({ checklist, isFinished, onHousePress, t }) => {
  const date = checklist?.date?._d?.toDate() || checklist?.date?.toDate();

  return (
    <View style={styles.headerSection}>
      {isFinished && (
        <View style={styles.finishedBadge}>
          <Icon name="check-circle" size={16} color="#10B981" />
          <Text style={styles.finishedText}>
            {t('checklists.checkPage.done')}
          </Text>
        </View>
      )}

      <Pressable style={styles.houseCard} onPress={onHousePress}>
        <View style={styles.houseCardContent}>
          <Icon name="home" size={20} color="#8B5CF6" />
          <View style={styles.houseInfo}>
            <Text style={styles.houseLabel}>Propiedad</Text>
            <Text style={styles.houseName}>
              {checklist?.house?.[0].houseName}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#CBD5E0" />
      </Pressable>

      <View style={styles.dateCard}>
        <Icon name="event" size={18} color="#55A5AD" />
        <View>
          <Text style={styles.dateLabel}>Fecha programada</Text>
          <Text style={styles.dateText}>{moment(date).format('LL')}</Text>
        </View>
      </View>
    </View>
  );
};

// Componente para el progreso circular
const ProgressCircle = ({ done, total }) => {
  const percentage = total > 0 ? (done / total) * 100 : 0;

  return (
    <View style={styles.progressContainer}>
      <AnimatedCircularProgress
        size={80}
        width={6}
        fill={percentage}
        tintColor="#55A5AD"
        backgroundColor="#F3F4F6"
        backgroundWidth={4}
        rotation={0}
      >
        {() => (
          <View style={styles.progressInner}>
            <Text style={styles.progressPercentage}>
              {Math.round(percentage)}%
            </Text>
            <Text style={styles.progressLabel}>
              {done}/{total}
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

// Componente para las observaciones
const ObservationsSection = ({ isOwner, checklist, docId, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.iconContainer}>
          <Icon name="chat-bubble-outline" size={18} color="#55A5AD" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>{t('checklists.comments')}</Text>
          <Text style={styles.sectionSubtitle}>
            {isOwner
              ? 'Estado del trabajo'
              : 'Añade detalles sobre el trabajo realizado'}
          </Text>
        </View>
      </View>
    </View>

    {isOwner ? (
      <View style={styles.ownerMessage}>
        <View style={styles.ownerMessageHeader}>
          <Icon name="info-outline" size={20} color="#3B82F6" />
          <Text style={styles.ownerMessageTitle}>Estado del equipo</Text>
        </View>
        <Text style={styles.ownerMessageText}>
          Nuestro equipo está trabajando para mantener tu casa limpia y segura.
          Aquí verás las actualizaciones de los trabajos realizados.
        </Text>
      </View>
    ) : (
      <View>
        {checklist && (
          <EditableInput
            value={checklist?.observations || ''}
            placeholder="Describe el trabajo realizado, incidencias encontradas, recomendaciones..."
            onPressAccept={change =>
              updateChecklistInput(docId, { observations: change })
            }
          />
        )}
      </View>
    )}
  </View>
);

// Componente para la lista de trabajadores
const WorkersSection = ({ workers, isOwner, t }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.iconContainer}>
          <Icon name="people" size={18} color="#55A5AD" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>
            {isOwner
              ? t('checklists.checkPage.workers')
              : t('common.asigned_workers')}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {workers?.length}{' '}
            {workers?.length === 1
              ? 'trabajador asignado'
              : 'trabajadores asignados'}
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.workersGrid}>
      {workers?.map((worker, i) => (
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
  </View>
);

const Info = ({ isCheckFinished }) => {
  const route = useRoute();
  const { isOwner } = useAuth();
  const { docId } = route.params;
  const { t } = useTranslation();

  const db = getFirestore();

  const query = useMemo(() => {
    return collection(doc(collection(db, 'checklists'), docId), 'checks');
  }, [docId, db]);

  const queryChecklist = useMemo(() => {
    return doc(collection(db, CHECKLISTS), docId);
  }, [docId, db]);

  const [checklist, loadingChecklist] = useDocumentData(queryChecklist, {
    idField: 'id'
  });

  const [checks, loadingChecks] = useCollectionData(query, {
    idField: 'id'
  });

  const doneCounter = checks?.filter(check => check.done).length || 0;

  const handleHousePress = () => {
    if (checklist?.house?.[0]?.id) {
      openScreenWithPush(HOUSE_SCREEN_KEY, {
        houseId: checklist.house[0].id
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con casa, fecha y progreso */}
      <View style={styles.topSection}>
        <View style={styles.leftSection}>
          {checklist && (
            <ChecklistHeader
              checklist={checklist}
              isFinished={isCheckFinished}
              onHousePress={handleHousePress}
              t={t}
            />
          )}
        </View>

        {!loadingChecks && checklist && (
          <ProgressCircle done={doneCounter} total={checklist?.total || 0} />
        )}
      </View>

      {/* Observaciones */}
      {checklist && (
        <ObservationsSection
          isOwner={isOwner}
          checklist={checklist}
          docId={docId}
          t={t}
        />
      )}

      {/* Trabajadores */}
      {checklist?.workers?.length > 0 && (
        <WorkersSection workers={checklist.workers} isOwner={isOwner} t={t} />
      )}

      {/* Lista de checks */}
      {!loadingChecklist && (
        <ListOfChecks
          disabled={isOwner}
          checks={checks}
          checkId={docId}
          isCheckFinished={isCheckFinished}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10
  },
  // Date Card
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
  // Header Section
  headerSection: {
    gap: 12
  },
  // House Card
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
  leftSection: {
    flex: 1
  },
  // Observations
  ownerMessage: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16
  },
  ownerMessageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  ownerMessageText: {
    color: '#1E40AF',
    fontSize: 14,
    lineHeight: 20
  },
  ownerMessageTitle: {
    color: '#1E40AF',
    fontSize: 15,
    fontWeight: '700'
  },
  // Progress Circle
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressInner: {
    alignItems: 'center'
  },
  progressLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  progressPercentage: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700'
  },
  scrollContent: {
    paddingBottom: 50
  },
  // Section
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionHeaderLeft: {
    alignItems: 'center',
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
  // Top Section
  topSection: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20
  },
  // Workers
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
