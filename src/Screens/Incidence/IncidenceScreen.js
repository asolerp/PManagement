import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// UI
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';
import { Info, Photos } from '../../components/Incidence';
import PageOptionsScreen from '../PageOptions/PageOptions';

// Firebase
import { useUpdateFirebase } from '../../hooks/useUpdateFirebase';
import { getFirestore, doc } from '@react-native-firebase/firestore';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';

// Utils
import {
  finishIncidence,
  openIncidence
} from '../../components/Alerts/incidences';
import { INCIDENCES } from '../../utils/firebaseKeys';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import { useTranslation } from 'react-i18next';
import { error } from '../../lib/logging';

// Loading State Component
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#55A5AD" />
  </View>
);

const IncidenceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { incidenceId } = route.params;
  const user = useSelector(userSelector);
  const [isUpdating, setIsUpdating] = useState(false);

  const db = getFirestore();
  const incidenceRef = doc(db, INCIDENCES, incidenceId);

  const [incidence, loading] = useDocumentDataOnce(incidenceRef, {
    snapshotListenOptions: { includeMetadataChanges: true }
  });

  const { updateFirebase } = useUpdateFirebase(INCIDENCES);

  // Determinar si está cargando
  const isLoading = loading || !incidence;

  const handleFinishTask = async status => {
    setIsUpdating(true);
    try {
      await updateFirebase(`${incidenceId}`, {
        done: status
      });
      navigation.goBack();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Determinar qué botón mostrar
  const renderFooterButton = () => {
    if (user.role !== 'admin' || isLoading) return null;

    return (
      <CustomButton
        loading={isUpdating}
        styled="rounded"
        title={
          incidence?.done ? t('incidence.resolved') : t('incidence.no_resolved')
        }
        onPress={() => {
          if (incidence?.done) {
            openIncidence(() => handleFinishTask(false));
          } else {
            finishIncidence(() => handleFinishTask(true));
          }
        }}
      />
    );
  };

  return (
    <>
      <ChatButtonWithMessagesCounter
        collection={INCIDENCES}
        docId={incidenceId}
      />
      <PageLayout
        safe
        backButton
        titleRightSide={
          !isLoading && (
            <PageOptionsScreen
              collection={INCIDENCES}
              ownerId={incidence?.user?.id}
              docId={incidenceId}
              editable={false}
              showDelete={true}
              duplicate={false}
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Info />
            <Photos />
          </ScrollView>
        )}
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100
  },
  scrollContent: {
    paddingBottom: 20
  },
  scrollView: {
    flex: 1
  }
});

export default IncidenceScreen;
