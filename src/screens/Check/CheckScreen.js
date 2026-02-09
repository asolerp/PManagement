import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { Info } from '../../components/Check';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';

import { sendOwnerChecklist } from '../../components/Alerts/checklist';

import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { CHECKLISTS } from '../../utils/firebaseKeys';
import { useTranslation } from 'react-i18next';
import { useCheck } from './hooks/useCheck';
import PageOptionsScreen from '../PageOptions/PageOptions';
import { useNotifyOwner } from '../../utils/useNotifyOwner';
import { error } from '../../lib/logging';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Theme/Variables';
import { popScreen } from '../../Router/utils/actions';

// Loading State Component
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#55A5AD" />
  </View>
);

const CheckScreen = ({ route }) => {
  // Protección contra params undefined (puede ocurrir durante navegación)
  const docId = route?.params?.docId;
  const { t } = useTranslation();

  // Estado para desactivar listeners antes de borrar
  // Esto previene el error "Cannot set property 'id' of undefined"
  const [isDeleting, setIsDeleting] = useState(false);

  const { isCheckFinished, isEmailSent, checklist, isDeleted } = useCheck({
    docId: isDeleting ? null : docId // Desactivar listener si estamos borrando
  });
  const { notifyOwner } = useNotifyOwner();
  const [isResending, setIsResending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const db = getFirestore();

  // Solo crear la referencia si tenemos docId válido Y no estamos borrando
  const checksCollection =
    docId && !isDeleting
      ? collection(doc(collection(db, CHECKLISTS), docId), 'checks')
      : null;

  const [checks, checksLoading] = useCollectionData(
    checksCollection,
    checksCollection ? { idField: 'id' } : undefined
  );

  const user = useSelector(userSelector);

  // Callback para preparar el borrado (desactiva listeners)
  const handlePrepareDelete = useCallback(() => {
    setIsDeleting(true);
  }, []);

  // Si el documento fue borrado o no hay docId, volver atrás
  useEffect(() => {
    if ((isDeleted && !isDeleting) || !docId) {
      popScreen();
    }
  }, [isDeleted, docId, isDeleting]);

  // Calcular si todos los checks están completos
  const areAllChecksDone = useMemo(() => {
    if (!checks || checks.length === 0) return false;
    return checks.length === checks.filter(check => check.done).length;
  }, [checks]);

  // Determinar si está cargando
  const isLoading = checksLoading || !checks || !checklist;

  const handleFinishAndSend = async () => {
    try {
      await notifyOwner(docId);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await notifyOwner(docId);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setIsResending(false);
    }
  };

  // Determinar qué botón mostrar
  const renderFooterButton = () => {
    if (user.role !== 'admin' || isLoading) return null;

    // Botón para finalizar checklist (cuando no está finalizado y todos los checks están hechos)
    if (areAllChecksDone && !isCheckFinished) {
      return (
        <CustomButton
          styled="rounded"
          loading={false}
          title={t('check.done')}
          onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
        />
      );
    }

    // Botón para reenviar email (cuando está finalizado pero email no enviado)
    if (isCheckFinished && !isEmailSent) {
      return (
        <CustomButton
          styled="rounded"
          loading={isResending}
          title={t('check.resendEmail')}
          onPress={handleResendEmail}
          variant="secondary"
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* Botón de opciones flotante */}
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        style={styles.floatingOptionsButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="more-vert" size={22} color={Colors.gray700} />
      </TouchableOpacity>

      <PageLayout
        safe
        backButton
        titleProps={{
          subPage: true
        }}
        footer={renderFooterButton()}
      >
        {isLoading ? (
          <LoadingState />
        ) : (
          <Info isCheckFinished={isCheckFinished} />
        )}
      </PageLayout>

      {/* Options Modal */}
      {showOptions && (
        <PageOptionsScreen
          editable={!isCheckFinished}
          collection={CHECKLISTS}
          docId={docId}
          showDelete={true}
          duplicate={true}
          isVisible={showOptions}
          onClose={() => setShowOptions(false)}
          onBeforeDelete={handlePrepareDelete}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingOptionsButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 18,
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    top: 52,
    width: 36,
    zIndex: 100
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100
  }
});

export default CheckScreen;
