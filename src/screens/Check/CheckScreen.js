import React, { useState } from 'react';

import { Info } from '../../components/Check';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';

import { sendOwnerChecklist } from '../../components/Alerts/checklist';

import firestore from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { CHECKLISTS } from '../../utils/firebaseKeys';
import { useTranslation } from 'react-i18next';
import { useCheck } from './hooks/useCheck';
import PageOptionsScreen from '../PageOptions/PageOptions';
import { useNotifyOwner } from '../../utils/useNotifyOwner';
import { error } from '../../lib/logging';

const CheckScreen = ({ route }) => {
  const { docId } = route.params;
  const { t } = useTranslation();

  const { isCheckFinished, isEmailSent } = useCheck({ docId });
  const { notifyOwner } = useNotifyOwner();
  const [isResending, setIsResending] = useState(false);
  const [checks, checksLoading] = useCollectionData(
    firestore().collection(CHECKLISTS).doc(docId).collection('checks'),
    {
      idField: 'id'
    }
  );

  const user = useSelector(userSelector);
  const areAllChecksDone =
    checks?.length === checks?.filter(check => check.done).length;

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

  return (
    <React.Fragment>
      <PageLayout
        safe
        backButton
        titleRightSide={
          <PageOptionsScreen
            editable={!isCheckFinished}
            collection={CHECKLISTS}
            docId={docId}
            showDelete={true}
            duplicate={true}
          />
        }
        titleProps={{
          subPage: true
        }}
        footer={
          user.role === 'admin' &&
          !checksLoading &&
          // Botón para finalizar checklist (cuando no está finalizado)
          (areAllChecksDone && !isCheckFinished ? (
            <CustomButton
              styled="rounded"
              loading={false}
              title={t('check.done')}
              onPress={() => sendOwnerChecklist(() => handleFinishAndSend())}
            />
          ) : // Botón para reenviar email (cuando está finalizado pero email no enviado)
          isCheckFinished && !isEmailSent ? (
            <CustomButton
              styled="rounded"
              loading={isResending}
              title={t('check.resendEmail')}
              onPress={handleResendEmail}
              variant="secondary"
            />
          ) : null)
        }
      >
        <Info isCheckFinished={isCheckFinished} />
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckScreen;
