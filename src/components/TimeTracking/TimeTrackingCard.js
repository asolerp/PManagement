import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import theme from '../../Theme/Theme';
import { Colors } from '../../Theme/Variables';
import Badge from '../Elements/Badge';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import Avatar from '../Avatar';
import { DEFAULT_IMAGE } from '../../constants/general';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import { useManualExit } from '../../hooks/useManualExit';
import { ManualExitModal } from './ManualExitModal';
import { useDeleteFirebase } from '../../hooks/useDeleteFirebase';

export const TimeTrackingCard = ({ entrance, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showManualExitModal, setShowManualExitModal] = useState(false);

  const user = useSelector(userSelector);
  const { markExitManually, loading: exitLoading } = useManualExit();
  const { deleteFirebase, loading: deleteLoading } = useDeleteFirebase();

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';
  const hasNoExit = !entrance.exitDate;

  const handleDelete = () => {
    Alert.alert(
      '🚨 Atención 🚨',
      '¿Seguro que quieres eliminar este registro de entrada? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFirebase('entrances', entrance.id);
              Alert.alert('Éxito', 'El registro ha sido eliminado', [
                { text: 'OK' }
              ]);
              if (onUpdate) {
                onUpdate();
              }
            } catch (err) {
              // El error ya se maneja en useDeleteFirebase
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  // Calculate total hours
  let totalHours = '';
  if (entrance.exitDate) {
    const entryMs =
      entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000;
    const exitMs =
      entrance.exitDate.seconds * 1000 +
      entrance.exitDate.nanoseconds / 1000000;
    const diffMs = exitMs - entryMs;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    totalHours = `${hours}h ${minutes}m`;
  }

  // Format dates
  const entryDate = new Date(
    entrance.date.seconds * 1000 + entrance.date.nanoseconds / 1000000
  );
  const dateStr = format(entryDate, 'dd/MM/yyyy');
  const entryTimeStr = format(entryDate, 'HH:mm');

  let exitTimeStr = '';
  if (entrance.exitDate) {
    const exitDate = new Date(
      entrance.exitDate.seconds * 1000 + entrance.exitDate.nanoseconds / 1000000
    );
    exitTimeStr = format(exitDate, 'HH:mm');
  }

  // Compatibilidad con ambos formatos: images (nuevo) y photos (antiguo)
  const entryPhoto = entrance.images?.[0]?.url || entrance.photos?.[0];
  const exitPhoto = entrance.images?.[1]?.url || entrance.photos?.[1];

  const openPhoto = photo => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  // Calculate map region
  const mapRegion = useMemo(() => {
    const location = entrance?.exitLocation || entrance?.location;
    if (!location) {
      return {
        latitude: 39.5743,
        longitude: 2.3969,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      };
    }

    // Si hay ambas ubicaciones, centrar el mapa entre ellas
    if (entrance?.location && entrance?.exitLocation) {
      const avgLat =
        (entrance.location.latitude + entrance.exitLocation.latitude) / 2;
      const avgLng =
        (entrance.location.longitude + entrance.exitLocation.longitude) / 2;
      const latDelta =
        Math.abs(entrance.location.latitude - entrance.exitLocation.latitude) *
        2.5;
      const lngDelta =
        Math.abs(
          entrance.location.longitude - entrance.exitLocation.longitude
        ) * 2.5;

      return {
        latitude: avgLat,
        longitude: avgLng,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01)
      };
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    };
  }, [entrance]);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        {/* Main content - compact layout */}
        <View style={styles.mainContent}>
          {/* Left: Worker avatar and info */}
          <View style={styles.leftSection}>
            {entrance.worker?.profileImage?.thumbnail ||
            entrance.worker?.profileImage?.small ? (
              <FastImage
                source={{
                  uri:
                    entrance.worker.profileImage.thumbnail ||
                    entrance.worker.profileImage.small
                }}
                style={styles.workerImage}
              />
            ) : (
              <View style={[styles.workerImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>
                  {entrance.worker?.name?.[0] ||
                    entrance.worker?.firstName?.[0] ||
                    '?'}
                </Text>
              </View>
            )}
            <View style={styles.workerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName} numberOfLines={1}>
                  {entrance.worker?.name ||
                    `${entrance.worker?.firstName || ''} ${entrance.worker?.secondName || ''}`.trim() ||
                    entrance.worker?.email ||
                    'Desconocido'}
                </Text>
                <View style={styles.timeContainer}>
                  <View style={styles.timeBlock}>
                    <Icon name="login" size={12} color={Colors.success} />
                    <Text style={styles.timeText}>{entryTimeStr}</Text>
                  </View>
                  <View style={styles.timeBlock}>
                    <Icon
                      name={exitTimeStr ? 'logout' : 'schedule'}
                      size={12}
                      color={exitTimeStr ? Colors.danger : Colors.warning}
                    />
                    <Text
                      style={[
                        styles.timeText,
                        !exitTimeStr && styles.pendingTimeText
                      ]}
                    >
                      {exitTimeStr || '--'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon
                    name="calendar-today"
                    size={12}
                    color={Colors.gray500}
                  />
                  <Text style={styles.metaText}>{dateStr}</Text>
                </View>
                {entrance.house?.houseName && (
                  <>
                    <View style={styles.metaDot} />
                    <View style={styles.metaItem}>
                      <Icon name="home" size={12} color={Colors.gray500} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {entrance.house.houseName}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Right: Status badge and manual exit button */}
          <View style={styles.rightSection}>
            {totalHours ? (
              <Badge text={totalHours} variant="success" />
            ) : (
              <>
                <Badge text="Pendiente" variant="warning" />
                {isOwnerOrAdmin && hasNoExit && (
                  <TouchableOpacity
                    style={styles.manualExitButton}
                    onPress={() => setShowManualExitModal(true)}
                    activeOpacity={0.7}
                  >
                    <Icon name="schedule" size={14} color={Colors.danger} />
                    <Text style={styles.manualExitText}>Marcar salida</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {isExpanded && (
          <View style={[theme.mT3, theme.pT3, styles.expandedSection]}>
            <View
              style={[
                theme.flexRow,
                theme.itemsCenter,
                theme.justifyBetween,
                theme.mB2
              ]}
            >
              <Text style={[theme.fontSansBold, theme.textBase]}>
                Ubicaciones GPS
              </Text>
              {(entrance.location || entrance.exitLocation) && (
                <TouchableOpacity
                  onPress={() => setShowMapModal(true)}
                  style={styles.mapButton}
                >
                  <Icon name="map" size={18} color={Colors.primary} />
                  <Text style={styles.mapButtonText}>Ver en mapa</Text>
                </TouchableOpacity>
              )}
            </View>

            {entrance.location && (
              <View style={theme.mB2}>
                <Text style={[theme.textGray600, theme.textXs]}>Entrada:</Text>
                <Text style={theme.textSm}>
                  {entrance.location.latitude.toFixed(6)},{' '}
                  {entrance.location.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {entrance.exitLocation && (
              <View style={theme.mB2}>
                <Text style={[theme.textGray600, theme.textXs]}>Salida:</Text>
                <Text style={theme.textSm}>
                  {entrance.exitLocation.latitude.toFixed(6)},{' '}
                  {entrance.exitLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <Text style={[theme.fontSansBold, theme.mT3, theme.mB2]}>
              Fotos
            </Text>

            <View style={styles.photosContainer}>
              {entryPhoto && (
                <TouchableOpacity
                  onPress={() => openPhoto(entryPhoto)}
                  style={[
                    styles.photoContainer,
                    exitPhoto && styles.photoContainerLeft
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.photoWrapper}>
                    <FastImage
                      style={styles.photoPreview}
                      source={{ uri: entryPhoto }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoLabel}>Entrada</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {exitPhoto && (
                <TouchableOpacity
                  onPress={() => openPhoto(exitPhoto)}
                  style={[
                    styles.photoContainer,
                    entryPhoto && styles.photoContainerRight
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.photoWrapper}>
                    <FastImage
                      style={styles.photoPreview}
                      source={{ uri: exitPhoto }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoLabel}>Salida</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {isOwnerOrAdmin && (
              <TouchableOpacity
                style={[styles.deleteButton, theme.mT3]}
                onPress={handleDelete}
                disabled={deleteLoading}
                activeOpacity={0.7}
              >
                <Icon name="delete" size={18} color={Colors.danger} />
                <Text style={styles.deleteButtonText}>Eliminar registro</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      <Modal
        isVisible={showPhotoModal}
        onBackdropPress={() => setShowPhotoModal(false)}
        onBackButtonPress={() => setShowPhotoModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {selectedPhoto && (
            <FastImage
              source={{ uri: selectedPhoto }}
              style={styles.fullImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPhotoModal(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal
        isVisible={showMapModal}
        onBackdropPress={() => setShowMapModal(false)}
        onBackButtonPress={() => setShowMapModal(false)}
        style={styles.mapModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View style={styles.mapModalContent}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Ubicación</Text>
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              style={styles.mapModalCloseButton}
            >
              <Icon name="close" size={24} color={Colors.gray900} />
            </TouchableOpacity>
          </View>
          <MapView
            style={styles.mapView}
            region={mapRegion}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {entrance.location && (
              <Marker
                coordinate={{
                  latitude: entrance.location.latitude,
                  longitude: entrance.location.longitude
                }}
                title="Entrada"
              >
                <View style={styles.markerContainer}>
                  <Avatar
                    uri={entrance.worker?.profileImage?.small || DEFAULT_IMAGE}
                    size="medium"
                  />
                </View>
              </Marker>
            )}
            {entrance.exitLocation && (
              <Marker
                coordinate={{
                  latitude: entrance.exitLocation.latitude,
                  longitude: entrance.exitLocation.longitude
                }}
                title="Salida"
              >
                <View style={[styles.markerContainer, styles.exitMarker]}>
                  <Avatar
                    uri={entrance.worker?.profileImage?.small || DEFAULT_IMAGE}
                    size="medium"
                  />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
      </Modal>

      {/* Manual Exit Modal */}
      <ManualExitModal
        isVisible={showManualExitModal}
        onClose={() => setShowManualExitModal(false)}
        onConfirm={async exitTime => {
          const success = await markExitManually(entrance.id, exitTime);
          if (success) {
            setShowManualExitModal(false);
            Alert.alert('Éxito', 'La salida ha sido marcada manualmente', [
              { text: 'OK' }
            ]);
            // Llamar callback para refrescar datos si existe
            if (onUpdate) {
              onUpdate();
            }
          }
        }}
        loading={exitLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  closeButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  closeButtonText: {
    color: Colors.gray900,
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: Colors.dangerLow,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  deleteButtonText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  exitMarker: {
    opacity: 0.7
  },
  expandedSection: {
    borderTopColor: Colors.gray200,
    borderTopWidth: 1
  },
  fullImage: {
    height: '80%',
    width: '100%'
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 12
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  manualExitButton: {
    alignItems: 'center',
    backgroundColor: Colors.dangerLow,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  manualExitText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '600'
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  mapButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  mapModal: {
    justifyContent: 'center',
    margin: 20
  },
  mapModalCloseButton: {
    padding: 8
  },
  mapModalContent: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 5,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  mapModalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  mapModalTitle: {
    color: Colors.gray900,
    fontSize: 18,
    fontWeight: 'bold'
  },
  mapView: {
    height: 400,
    width: '100%'
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  metaDot: {
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    height: 4,
    width: 4
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4
  },
  metaText: {
    color: Colors.gray600,
    fontSize: 11,
    maxWidth: 120
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pendingTime: {
    color: Colors.warning
  },
  pendingTimeText: {
    color: Colors.warning
  },
  photoContainer: {
    flex: 1
  },
  photoContainerLeft: {
    marginRight: 6
  },
  photoContainerRight: {
    marginLeft: 6
  },
  photoLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  photoOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 0
  },
  photoPreview: {
    backgroundColor: Colors.gray100,
    height: 120,
    width: '100%'
  },
  photoWrapper: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.grey,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  placeholderImage: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    justifyContent: 'center'
  },
  placeholderText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold'
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },
  timeBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  timeText: {
    color: Colors.gray900,
    fontSize: 13,
    fontWeight: '600'
  },
  workerImage: {
    borderRadius: 20,
    height: 40,
    marginRight: 10,
    width: 40
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    color: Colors.gray900,
    fontSize: 14,
    fontWeight: '600'
  }
});
