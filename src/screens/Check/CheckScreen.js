import React, { useState, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

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

// Loading State Component
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#55A5AD" />
  </View>
);

const CheckScreen = ({ route }) => {
  const { docId } = route.params;
  const { t } = useTranslation();

  const { isCheckFinished, isEmailSent, checklist } = useCheck({ docId });
  const { notifyOwner } = useNotifyOwner();
  const [isResending, setIsResending] = useState(false);

  const db = getFirestore();
  const checksCollection = collection(
    doc(collection(db, CHECKLISTS), docId),
    'checks'
  );
  const [checks, checksLoading] = useCollectionData(checksCollection, {
    idField: 'id'
  });

  const user = useSelector(userSelector);

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
    <PageLayout
      safe
      backButton
      titleRightSide={
        !isLoading && (
          <PageOptionsScreen
            editable={!isCheckFinished}
            collection={CHECKLISTS}
            docId={docId}
            showDelete={true}
            duplicate={true}
          />
        )
      }
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
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100
  }
});

export default CheckScreen;
