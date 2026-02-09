import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PageLayout from '../../components/PageLayout';
import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { usePhotos } from '../../utils/usePhotos';
import { parseRef } from './utils/parseRef';
import { CHECKLISTS } from '../../utils/firebaseKeys';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_GAP = 8;
const HORIZONTAL_PADDING = 16;
const NUM_COLUMNS = 3;
const PHOTO_SIZE =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - PHOTO_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

// Header con información del check
const PhotosHeader = ({ title, date, photoCount, selectedCount, t }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle} numberOfLines={2}>
        {title}
      </Text>
      {date && (
        <View style={styles.dateRow}>
          <Icon name="event" size={14} color="#6B7280" />
          <Text style={styles.dateText}>
            {moment(date?.toDate?.() || date).format('LL')}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.headerStats}>
      <View style={styles.photoBadge}>
        <Icon name="photo-library" size={16} color="#55A5AD" />
        <Text style={styles.photoCountText}>
          {photoCount}{' '}
          {photoCount === 1 ? t('common.photo') : t('common.photos')}
        </Text>
      </View>
      {selectedCount > 0 && (
        <View style={styles.selectedBadge}>
          <Icon name="check-circle" size={14} color="#EF4444" />
          <Text style={styles.selectedText}>
            {selectedCount} {t('common.selected')}
          </Text>
        </View>
      )}
    </View>
  </View>
);

// Estado vacío
const EmptyState = ({ t }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Icon name="photo-camera" size={48} color="#D1D5DB" />
    </View>
    <Text style={styles.emptyTitle}>{t('checkPhotos.noPhotos')}</Text>
    <Text style={styles.emptySubtitle}>
      {t('checkPhotos.noPhotosDescription')}
    </Text>
  </View>
);

// Estado de carga
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#55A5AD" />
  </View>
);

// Componente de foto individual
const PhotoItem = ({ photo, index, isSelected, onPress, onLongPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => onPress(index)}
    onLongPress={() => onLongPress(photo)}
    delayLongPress={200}
    style={styles.photoWrapper}
  >
    <View style={[styles.photoContainer, isSelected && styles.photoSelected]}>
      <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
      {isSelected && (
        <View style={styles.selectedOverlay}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// Modal de confirmación de eliminación
const DeleteConfirmModal = ({ visible, onClose, onConfirm, count, t }) => (
  <Modal
    isVisible={visible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    backdropOpacity={0.5}
    animationIn="fadeInUp"
    animationOut="fadeOutDown"
    style={styles.modalContainer}
  >
    <View style={styles.modalContent}>
      {/* Icono */}
      <View style={styles.modalIconContainer}>
        <Icon name="delete-forever" size={32} color="#EF4444" />
      </View>

      {/* Título */}
      <Text style={styles.modalTitle}>
        {t('checkPhotos.deleteTitle', { defaultValue: '¿Eliminar fotos?' })}
      </Text>

      {/* Descripción */}
      <Text style={styles.modalDescription}>
        {count === 1
          ? t('checkPhotos.deleteDescriptionSingle', {
              defaultValue: 'Esta foto se eliminará permanentemente.'
            })
          : t('checkPhotos.deleteDescriptionMultiple', {
              count,
              defaultValue: `Se eliminarán ${count} fotos permanentemente.`
            })}
      </Text>

      {/* Advertencia */}
      <View style={styles.modalWarning}>
        <Icon name="warning" size={16} color="#F59E0B" />
        <Text style={styles.modalWarningText}>
          {t('checkPhotos.deleteWarning')}
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.modalButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.modalButton,
            styles.modalCancelButton,
            pressed && styles.modalButtonPressed
          ]}
          onPress={onClose}
        >
          <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.modalButton,
            styles.modalDeleteButton,
            pressed && styles.modalDeleteButtonPressed
          ]}
          onPress={onConfirm}
        >
          <Icon name="delete" size={18} color="#FFFFFF" />
          <Text style={styles.modalDeleteText}>
            {t('common.delete')} ({count})
          </Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

// Barra de selección mejorada
const SelectionBar = ({ count, onCancel, onDelete, t }) => (
  <View style={styles.selectionBar}>
    <View style={styles.selectionBarContent}>
      {/* Botón cancelar */}
      <Pressable
        style={({ pressed }) => [
          styles.selectionButton,
          styles.cancelButton,
          pressed && styles.buttonPressed
        ]}
        onPress={onCancel}
      >
        <Icon name="close" size={18} color="#6B7280" />
      </Pressable>

      {/* Info central */}
      <View style={styles.selectionInfo}>
        <View style={styles.selectionBadge}>
          <Icon name="photo-library" size={16} color="#55A5AD" />
          <Text style={styles.selectionCount}>{count}</Text>
        </View>
        <Text style={styles.selectionLabel}>
          {count === 1 ? t('common.photo') : t('common.photos')}{' '}
          {t('common.selected')}
        </Text>
      </View>

      {/* Botón eliminar */}
      <Pressable
        style={({ pressed }) => [
          styles.selectionButton,
          styles.deleteButton,
          pressed && styles.deleteButtonPressed
        ]}
        onPress={onDelete}
      >
        <Icon name="delete-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  </View>
);

const CheckPhotosScreen = ({ route }) => {
  const { title, checkId, checkItemId, date } = route.params;
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [photosSelected, setPhotosSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { removePhotos } = usePhotos();

  const db = getFirestore();
  const query = useMemo(() => {
    return doc(
      collection(doc(collection(db, 'checklists'), checkId), 'checks'),
      checkItemId
    );
  }, [db, checkId, checkItemId]);

  const [values, loading] = useDocumentData(query, {
    idField: 'id'
  });

  const photos = values?.photos || [];
  const isSelectionMode = photosSelected.length > 0;

  const handlePressPhoto = index => {
    if (isSelectionMode) {
      // En modo selección, toggle la foto
      const photo = photos[index];
      handleToggleSelection(photo);
    } else {
      // Modo normal, abrir visor
      setImageIndex(index);
      setModalVisible(true);
    }
  };

  const handleToggleSelection = photo => {
    const isSelected = photosSelected.some(p => p.id === photo);
    if (isSelected) {
      setPhotosSelected(photosSelected.filter(p => p.id !== photo));
    } else {
      setPhotosSelected([
        ...photosSelected,
        { id: photo, ref: parseRef(photo) }
      ]);
    }
  };

  const handleCancelSelection = () => {
    setPhotosSelected([]);
  };

  const handleDeletePhoto = async () => {
    const checkQuery = doc(
      collection(doc(collection(db, CHECKLISTS), checkId), 'checks'),
      checkItemId
    );

    const photosWithUri = photosSelected.map(photo => ({
      uri: photo.id,
      ref: photo.ref
    }));

    await removePhotos(photosWithUri, setPhotosSelected, {
      collectionRef: checkQuery
    });
    setDeleteModal(false);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (photos.length === 0) {
      return <EmptyState t={t} />;
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo}
              photo={photo}
              index={index}
              isSelected={photosSelected.some(p => p.id === photo)}
              onPress={handlePressPhoto}
              onLongPress={handleToggleSelection}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <PageLayout safe backButton>
      <View style={styles.container}>
        {/* Header */}
        <PhotosHeader
          title={title}
          date={date}
          photoCount={photos.length}
          selectedCount={photosSelected.length}
          t={t}
        />

        {/* Barra de selección */}
        {isSelectionMode && (
          <SelectionBar
            count={photosSelected.length}
            onCancel={handleCancelSelection}
            onDelete={() => setDeleteModal(true)}
            t={t}
          />
        )}

        {/* Contenido */}
        {renderContent()}

        {/* Visor de imágenes */}
        <ImageView
          visible={modalVisible}
          imageIndex={imageIndex}
          images={photos.map(photo => ({ uri: photo }))}
          onRequestClose={() => setModalVisible(false)}
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />

        {/* Modal de confirmación */}
        <DeleteConfirmModal
          visible={deleteModal}
          onClose={() => setDeleteModal(false)}
          onConfirm={handleDeletePhoto}
          count={photosSelected.length}
          t={t}
        />
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }]
  },
  cancelButton: {
    backgroundColor: '#F1F5F9'
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  container: {
    flex: 1
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6
  },
  dateText: {
    color: '#6B7280',
    fontSize: 13
  },
  deleteButton: {
    backgroundColor: '#EF4444'
  },
  deleteButtonPressed: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 0.95 }]
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32
  },
  emptyIconContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  emptyTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingBottom: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8
  },
  headerContent: {
    marginBottom: 12
  },
  headerStats: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14
  },
  modalButtonPressed: {
    opacity: 0.8
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600'
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    width: SCREEN_WIDTH - 48
  },
  modalDeleteButton: {
    backgroundColor: '#EF4444'
  },
  modalDeleteButtonPressed: {
    backgroundColor: '#DC2626'
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  modalDescription: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center'
  },
  modalIconContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  modalWarning: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  modalWarningText: {
    color: '#92400E',
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  photo: {
    borderRadius: 12,
    height: '100%',
    width: '100%'
  },
  photoBadge: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  photoContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: PHOTO_SIZE,
    overflow: 'hidden',
    width: PHOTO_SIZE
  },
  photoCountText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '600'
  },
  photoSelected: {
    borderColor: '#55A5AD',
    borderWidth: 3
  },
  photoWrapper: {
    marginBottom: PHOTO_GAP
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PHOTO_GAP,
    paddingHorizontal: HORIZONTAL_PADDING
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16
  },
  selectedBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  selectedOverlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(85, 165, 173, 0.3)',
    height: '100%',
    justifyContent: 'flex-start',
    padding: 8,
    position: 'absolute',
    width: '100%'
  },
  selectedText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600'
  },
  selectionBadge: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  selectionBar: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12
  },
  selectionBarContent: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6
  },
  selectionButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  selectionCount: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '700'
  },
  selectionInfo: {
    alignItems: 'center',
    flex: 1,
    gap: 4
  },
  selectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500'
  }
});

export default CheckPhotosScreen;
