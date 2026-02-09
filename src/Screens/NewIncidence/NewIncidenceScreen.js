import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// UI
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import NewIncidenceForm from '../../components/Forms/Incidence/NewIncidenceForm';
import MultipleImageSelector from '../../components/MultipleImageSelector';
import { DismissKeyboard } from '../../components/DismissKeyboard';

// Firebase
import { useAddFirebase } from '../../hooks/useAddFirebase';
import useUploadImageCheck from '../../hooks/useUploadImage';

// Redux
import { userSelector } from '../../Store/User/userSlice';
import {
  resetForm,
  setImages
} from '../../Store/IncidenceForm/incidenceFormSlice';

// Utils
import { popScreen } from '../../Router/utils/actions';
import { error } from '../../lib/logging';
import { LoadingModalContext } from '../../context/loadinModalContext';
import { INCIDENCES } from '../../utils/firebaseKeys';

const NewIncidenceScreen = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { setVisible } = useContext(LoadingModalContext);
  const [loading, setLoading] = useState(false);

  const user = useSelector(userSelector, shallowEqual);
  const { incidence, incidenceImages } = useSelector(
    ({ incidenceForm: { incidence, incidenceImages } }) => ({
      incidence,
      incidenceImages
    }),
    shallowEqual
  );

  const { uploadImages } = useUploadImageCheck(INCIDENCES);
  const { addFirebase } = useAddFirebase();

  const setImagesAction = useCallback(
    images => dispatch(setImages({ images })),
    [dispatch]
  );

  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);

  const hasFormFilled =
    !!incidence?.title &&
    incidence?.incidence &&
    incidence?.house?.value?.length > 0;

  const createIncidence = async () => {
    try {
      setLoading(true);
      setVisible(true);

      const newIncidence = await addFirebase('incidences', {
        ...incidence,
        house: incidence.house.value[0],
        user: user,
        houseId: incidence.house.value[0].id,
        workers: [user],
        workersId: [user.id],
        state: 'initiate',
        date: new Date(),
        done: false
      });

      if (incidenceImages?.length > 0) {
        await uploadImages(incidenceImages, null, newIncidence.id);
      }

      resetFormAction();
      popScreen();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    resetFormAction();
  }, []);

  const renderFooterButton = () => (
    <CustomButton
      disabled={!hasFormFilled}
      styled="rounded"
      loading={loading}
      title={t('newIncidence.form.create')}
      onPress={createIncidence}
    />
  );

  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        subPage: true
      }}
      footer={renderFooterButton()}
    >
      <DismissKeyboard>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader
            title={t('newIncidence.title')}
            subtitle="Reporta un problema o incidencia encontrada"
          />

          <View style={styles.formContainer}>
            <NewIncidenceForm />
          </View>

          <View style={styles.photosSection}>
            <View style={styles.photosSectionHeader}>
              <Text style={styles.photosSectionTitle}>
                {t('newIncidence.form.photos')}
              </Text>
              <Text style={styles.photosSectionSubtitle}>
                {incidenceImages?.length > 0
                  ? `${incidenceImages.length} ${incidenceImages.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}`
                  : 'Opcional'}
              </Text>
            </View>
            <MultipleImageSelector
              images={incidenceImages}
              setImages={setImagesAction}
            />
          </View>
        </ScrollView>
      </DismissKeyboard>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24
  },
  photosSection: {
    marginTop: 24
  },
  photosSectionHeader: {
    gap: 4,
    marginBottom: 16
  },
  photosSectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 13
  },
  photosSectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  },
  scrollContent: {
    paddingBottom: 30
  },
  scrollView: {
    flex: 1,
    paddingTop: 10
  }
});

export default NewIncidenceScreen;
