import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../components/Avatar';

import moment from 'moment';
import { increment } from '@react-native-firebase/firestore';

import PhotoCameraModal from './Modals/PhotoCameraModal';
import { useSelector } from 'react-redux';
import { userSelector } from '../Store/User/userSlice';
import { useUpdateFirebase } from '../hooks/useUpdateFirebase';
import { error, Logger } from '../lib/logging';
import { openScreenWithPush } from '../Router/utils/actions';
import { CHECK_PHOTO_SCREEN_KEY } from '../Router/utils/routerKeys';

import * as Localization from 'expo-localization';
import useUploadImageCheck from '../hooks/useUploadImage';
import { CHECKLISTS } from '../utils/firebaseKeys';
import { LoadingModalContext } from '../context/loadinModalContext';
import { timeout } from '../utils/timeout';
import { useQueryClient } from '@tanstack/react-query';

// Checkbox personalizado con Pressable
const CustomCheckbox = ({ checked, onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.customCheckbox,
      checked && styles.customCheckboxChecked,
      disabled && styles.customCheckboxDisabled,
      pressed && styles.customCheckboxPressed
    ]}
  >
    {checked && <Icon name="check" size={18} color="#FFFFFF" />}
  </Pressable>
);

// Componente para la sección de información del check
const CheckInfo = ({ check, onPress }) => {
  const locale = Localization.getLocales()[0]?.languageCode || 'en';
  const title = check?.locale?.[locale];
  const isDone = check.done;

  return (
    <Pressable onPress={onPress} style={styles.checkInfoContainer}>
      <Text
        style={[styles.checkTitle, isDone && styles.checkTitleDone]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {check?.date && (
        <View style={styles.dateContainer}>
          <Icon name="check-circle" size={14} color="#10B981" />
          <Text style={styles.dateText}>
            {moment(check?.date?.toDate()).format('LL')}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// Componente para mostrar trabajador y fotos
const CheckMetadata = ({ check }) => {
  const hasWorker = check?.worker;
  const hasPhotos = check?.photos?.length > 0;

  if (!hasWorker && !hasPhotos) return null;

  return (
    <View style={styles.metadataContainer}>
      {hasWorker && (
        <Avatar
          key={check?.worker?.uid}
          uri={check?.worker?.profileImage?.small}
          size="small"
          showName={false}
        />
      )}
      {hasPhotos && (
        <View style={styles.photoBadge}>
          <Icon name="photo-camera" size={14} color="#F59E0B" />
          <Text style={styles.photoCount}>{check?.photos?.length}</Text>
        </View>
      )}
    </View>
  );
};

// Componente para el botón de cámara
const CameraButton = ({ onPress, hasPhotos, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.cameraButton,
      hasPhotos && styles.cameraButtonWithPhotos,
      pressed && styles.buttonPressed
    ]}
  >
    <Icon name="camera-alt" size={18} color="#FFFFFF" />
  </Pressable>
);

const ItemCheck = ({ check, checklistId, disabled, isCheckFinished }) => {
  const [photoCameraModal, setPhotoCameraModal] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState(check.done);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateFirebase } = useUpdateFirebase(CHECKLISTS);
  const queryClient = useQueryClient();
  const { uploadImages } = useUploadImageCheck(CHECKLISTS);
  const { setVisible } = useContext(LoadingModalContext);
  const user = useSelector(userSelector);

  // Sincronizar estado optimista con check.done cuando cambie desde Firestore
  React.useEffect(() => {
    setOptimisticDone(check.done);
  }, [check.done]);

  const handleSelectImage = async imgs => {
    try {
      setPhotoCameraModal(false);
      await timeout(400);
      setVisible(true);
      await uploadImages(imgs, check, checklistId);
    } catch (err) {
      Logger.error(
        'Failed to upload images',
        err instanceof Error ? err : new Error(String(err)),
        { checkId: check?.id, checklistId }
      );
    } finally {
      setVisible(false);
    }
  };

  const handleCheck = async () => {
    const newStatus = !optimisticDone;

    // Prevenir cambios si el estado ya es el mismo
    if (check.done === newStatus) {
      Logger.debug('Check already in same state, ignoring', {
        checkId: check.id,
        newStatus
      });
      return;
    }

    // Prevenir doble click
    if (isUpdating) {
      Logger.debug('Check update in progress, ignoring duplicate click');
      return;
    }

    // Actualización optimista: cambiar el UI inmediatamente
    setOptimisticDone(newStatus);
    setIsUpdating(true);

    try {
      await updateFirebase(`${checklistId}/checks/${check?.id}`, {
        ...check,
        date: !newStatus ? null : new Date(),
        done: newStatus,
        worker: newStatus ? user : null
      });
      await updateFirebase(`${checklistId}`, {
        done: newStatus ? increment(1) : increment(-1)
      });

      // Invalidar queries de checklists para actualizar la lista
      queryClient.invalidateQueries({
        queryKey: ['checklistsNotFinishedPaginated']
      });
      queryClient.invalidateQueries({
        queryKey: ['checklistsFinishedPaginated']
      });
    } catch (err) {
      // Si falla, revertir el estado optimista
      setOptimisticDone(check.done);
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePressInfo = () => {
    if (check?.photos?.length > 0) {
      const locale = Localization.getLocales()[0]?.languageCode || 'en';
      openScreenWithPush(CHECK_PHOTO_SCREEN_KEY, {
        checkId: checklistId,
        checkItemId: check.id,
        title: check.locale[locale],
        date: check.date
      });
    }
  };

  return (
    <>
      <PhotoCameraModal
        visible={photoCameraModal}
        handleVisibility={setPhotoCameraModal}
        onSelectImage={handleSelectImage}
      />

      <View style={styles.container}>
        {/* Checkbox Personalizado */}
        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            checked={optimisticDone}
            onPress={handleCheck}
            disabled={disabled || isUpdating}
          />
        </View>

        {/* Información del check */}
        <View style={styles.contentContainer}>
          <CheckInfo
            check={{ ...check, done: optimisticDone }}
            onPress={handlePressInfo}
          />
          <CheckMetadata check={check} />
        </View>

        {/* Botón de cámara */}
        <CameraButton
          onPress={() => !isCheckFinished && setPhotoCameraModal(true)}
          hasPhotos={check?.photos?.length > 0}
          disabled={isCheckFinished}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.7
  },
  // Camera Button
  cameraButton: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  cameraButtonWithPhotos: {
    backgroundColor: '#F59E0B'
  },
  // Check Info
  checkInfoContainer: {
    flex: 1
  },
  checkTitle: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4
  },
  checkTitleDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  checkboxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  contentContainer: {
    flex: 1,
    gap: 8,
    marginRight: 12
  },
  // Custom Checkbox
  customCheckbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  customCheckboxChecked: {
    backgroundColor: '#55A5AD',
    borderColor: '#55A5AD'
  },
  customCheckboxDisabled: {
    opacity: 0.5
  },
  customCheckboxPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }]
  },
  // Date
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  dateText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600'
  },
  // Metadata
  metadataContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  photoBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  photoCount: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700'
  }
});

export default ItemCheck;
