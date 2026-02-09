import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { increment } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

// UI
import PageLayout from '../../components/PageLayout';
import NewIncidenceForm from '../../components/Forms/Incidence/NewIncidenceForm';
import MultipleImageSelector from '../../components/MultipleImageSelector';
import CustomButton from '../../components/Elements/CustomButton';

// Firebase
import { useAddFirebase } from '../../hooks/useAddFirebase';
import { useUpdateFirebase } from '../../hooks/useUpdateFirebase';
import { useUploadCloudinaryImage } from '../../hooks/useUploadCloudinaryImage';

// Store
import { userSelector } from '../../Store/User/userSlice';
import {
  resetForm,
  setImages
} from '../../Store/IncidenceForm/incidenceFormSlice';

// Utils & Theme
import { Logger } from '../../lib/logging';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadows
} from '../../Theme/Variables';

const NewIncidence = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const user = useSelector(userSelector, shallowEqual);

  const { incidence, incidenceImages } = useSelector(
    ({ incidenceForm: { incidence, incidenceImages } }) => ({
      incidence,
      incidenceImages
    }),
    shallowEqual
  );

  const setImagesAction = useCallback(
    images => dispatch(setImages({ images })),
    [dispatch]
  );

  const { updateFirebase } = useUpdateFirebase('incidences');
  const resetFormAction = useCallback(() => dispatch(resetForm()), [dispatch]);
  const { addFirebase } = useAddFirebase();
  const { upload } = useUploadCloudinaryImage();

  const showAlert = message => {
    Alert.alert(t('common.error'), message, [
      { text: t('common.ok'), style: 'default' }
    ]);
  };

  const createIncidence = async () => {
    try {
      setLoading(true);

      await updateFirebase('stats', {
        count: increment(1)
      });

      const newIncidence = await addFirebase('incidences', {
        ...incidence,
        house: incidence.house.value[0],
        user: user,
        houseId: incidence.house.value[0].id,
        state: 'iniciada',
        date: new Date(),
        done: false
      });

      if (incidenceImages?.length > 0) {
        const uploadImages = incidenceImages.map(file =>
          upload(file, `/PortManagement/Incidences/${newIncidence.id}/Photos`)
        );

        const imagesURLs = await Promise.all(uploadImages);

        await updateFirebase(`${newIncidence.id}`, {
          photos: imagesURLs
        });
      }

      resetFormAction();
      navigation.goBack();
    } catch (err) {
      Logger.error('Error creating incidence', err, {
        service: 'NewIncidence'
      });
      showAlert(t('newIncidence.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        title: t('newIncidence.title'),
        subPage: true
      }}
      footer={
        <CustomButton
          loading={loading}
          title={t('newIncidence.form.create')}
          onPress={createIncidence}
        />
      }
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Icon name="report-problem" size={28} color={Colors.white} />
          </View>
          <Text style={styles.subtitle}>{t('newIncidence.subtitle')}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <NewIncidenceForm />
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.sectionHeader}>
            <Icon name="photo-camera" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {t('newIncidence.form.photos')}
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('newIncidence.form.photos_description')}
          </Text>
          <MultipleImageSelector
            images={incidenceImages}
            setImages={setImagesAction}
          />
        </View>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Spacing.xl
  },
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    ...Shadows.sm
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.full,
    height: 56,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: 56
  },
  photosSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.sm
  },
  sectionDescription: {
    color: Colors.gray500,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs
  },
  sectionTitle: {
    color: Colors.gray800,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold
  },
  subtitle: {
    color: Colors.gray600,
    fontSize: FontSize.base,
    textAlign: 'center'
  }
});

export default NewIncidence;
