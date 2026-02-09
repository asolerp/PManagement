import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import theme from '../../Theme/Theme';
import { Colors, Spacing, BorderRadius, Shadows } from '../../Theme/Variables';
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
        {/* Main content - redesigned layout with photos */}
        <View style={styles.mainContent}>
          {/* Top row: Time info with status */}
          <View style={styles.topRow}>
            <View style={styles.timeInfo}>
              <View style={styles.timeBlock}>
                <View style={[styles.timeIconBg, styles.entryIconBg]}>
                  <Icon name="login" size={12} color={Colors.white} />
                </View>
                <Text style={styles.timeTextBold}>{entryTimeStr}</Text>
              </View>
              <Icon name="arrow-forward" size={14} color={Colors.gray400} />
              <View style={styles.timeBlock}>
                <View style={[styles.timeIconBg, exitTimeStr ? styles.exitIconBg : styles.pendingIconBg]}>
                  <Icon name={exitTimeStr ? 'logout' : 'schedule'} size={12} color={Colors.white} />
                </View>
                <Text style={[styles.timeTextBold, !exitTimeStr && styles.pendingTimeText]}>
                  {exitTimeStr || '--:--'}
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              {totalHours ? (
                <View style={styles.durationBadge}>
                  <Icon name="timer" size={14} color={Colors.success} />
                  <Text style={styles.durationText}>{totalHours}</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>En curso</Text>
                </View>
              )}
            </View>
          </View>

          {/* Middle: Photos thumbnails (if available) */}
          {(entryPhoto || exitPhoto) && (
            <View style={styles.photoThumbnails}>
              {entryPhoto && (
                <TouchableOpacity
                  style={styles.thumbnailContainer}
                  onPress={() => openPhoto(entryPhoto)}
                  activeOpacity={0.8}
                >
                  <FastImage
                    style={styles.thumbnail}
                    source={{ uri: entryPhoto }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.thumbnailLabel}>
                    <Icon name="login" size={10} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              )}
              {exitPhoto && (
                <TouchableOpacity
                  style={styles.thumbnailContainer}
                  onPress={() => openPhoto(exitPhoto)}
                  activeOpacity={0.8}
                >
                  <FastImage
                    style={styles.thumbnail}
                    source={{ uri: exitPhoto }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={[styles.thumbnailLabel, styles.thumbnailLabelExit]}>
                    <Icon name="logout" size={10} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              )}
              {!entryPhoto && !exitPhoto && null}
            </View>
          )}

          {/* Bottom: Meta info */}
          <View style={styles.bottomRow}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <Icon name="calendar-today" size={12} color={Colors.gray500} />
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
            <View style={styles.expandIndicator}>
              <Icon 
                name={isExpanded ? 'expand-less' : 'expand-more'} 
                size={20} 
                color={Colors.gray400} 
              />
            </View>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* GPS Locations Section */}
            <View style={styles.expandedBlock}>
              <View style={styles.expandedHeader}>
                <Icon name="location-on" size={16} color={Colors.primary} />
                <Text style={styles.expandedTitle}>Ubicaciones GPS</Text>
                {(entrance.location || entrance.exitLocation) && (
                  <TouchableOpacity
                    onPress={() => setShowMapModal(true)}
                    style={styles.mapButton}
                  >
                    <Icon name="map" size={16} color={Colors.primary} />
                    <Text style={styles.mapButtonText}>Ver mapa</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.locationGrid}>
                {entrance.location && (
                  <View style={styles.locationItem}>
                    <View style={[styles.locationIcon, styles.entryIconBg]}>
                      <Icon name="login" size={12} color={Colors.white} />
                    </View>
                    <View>
                      <Text style={styles.locationLabel}>Entrada</Text>
                      <Text style={styles.locationCoords}>
                        {entrance.location.latitude.toFixed(5)}, {entrance.location.longitude.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                )}

                {entrance.exitLocation && (
                  <View style={styles.locationItem}>
                    <View style={[styles.locationIcon, styles.exitIconBg]}>
                      <Icon name="logout" size={12} color={Colors.white} />
                    </View>
                    <View>
                      <Text style={styles.locationLabel}>Salida</Text>
                      <Text style={styles.locationCoords}>
                        {entrance.exitLocation.latitude.toFixed(5)}, {entrance.exitLocation.longitude.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Photos Section - Large view */}
            {(entryPhoto || exitPhoto) && (
              <View style={styles.expandedBlock}>
                <View style={styles.expandedHeader}>
                  <Icon name="photo-library" size={16} color={Colors.primary} />
                  <Text style={styles.expandedTitle}>Fotos</Text>
                </View>

                <View style={styles.photosGrid}>
                  {entryPhoto && (
                    <TouchableOpacity
                      onPress={() => openPhoto(entryPhoto)}
                      style={styles.photoLarge}
                      activeOpacity={0.8}
                    >
                      <FastImage
                        style={styles.photoLargeImage}
                        source={{ uri: entryPhoto }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <View style={styles.photoLargeOverlay}>
                        <Icon name="login" size={14} color={Colors.white} />
                        <Text style={styles.photoLargeLabel}>Entrada</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {exitPhoto && (
                    <TouchableOpacity
                      onPress={() => openPhoto(exitPhoto)}
                      style={styles.photoLarge}
                      activeOpacity={0.8}
                    >
                      <FastImage
                        style={styles.photoLargeImage}
                        source={{ uri: exitPhoto }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <View style={[styles.photoLargeOverlay, styles.photoLargeOverlayExit]}>
                        <Icon name="logout" size={14} color={Colors.white} />
                        <Text style={styles.photoLargeLabel}>Salida</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Admin Actions */}
            {isOwnerOrAdmin && (
              <View style={styles.adminActions}>
                {hasNoExit && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowManualExitModal(true)}
                    activeOpacity={0.7}
                  >
                    <Icon name="schedule" size={16} color={Colors.warning} />
                    <Text style={styles.actionButtonTextWarning}>Marcar salida manual</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteActionButton]}
                  onPress={handleDelete}
                  disabled={deleteLoading}
                  activeOpacity={0.7}
                >
                  <Icon name="delete" size={16} color={Colors.danger} />
                  <Text style={styles.actionButtonTextDanger}>Eliminar registro</Text>
                </TouchableOpacity>
              </View>
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
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    ...Shadows.small
  },
  mainContent: {
    gap: Spacing.sm
  },
  // Top Row Styles
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timeInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm
  },
  timeBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  timeIconBg: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  entryIconBg: {
    backgroundColor: Colors.success
  },
  exitIconBg: {
    backgroundColor: Colors.secondary
  },
  pendingIconBg: {
    backgroundColor: Colors.warning
  },
  timeTextBold: {
    color: Colors.gray900,
    fontSize: 15,
    fontWeight: '700'
  },
  pendingTimeText: {
    color: Colors.warning
  },
  statusContainer: {
    alignItems: 'flex-end'
  },
  durationBadge: {
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4
  },
  durationText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '700'
  },
  pendingBadge: {
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4
  },
  pendingBadgeText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '600'
  },
  // Photo Thumbnails
  photoThumbnails: {
    flexDirection: 'row',
    gap: Spacing.xs
  },
  thumbnailContainer: {
    borderRadius: BorderRadius.md,
    height: 56,
    overflow: 'hidden',
    position: 'relative',
    width: 56
  },
  thumbnail: {
    height: '100%',
    width: '100%'
  },
  thumbnailLabel: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 10,
    bottom: 4,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    width: 20
  },
  thumbnailLabelExit: {
    backgroundColor: Colors.secondary
  },
  // Bottom Row
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4
  },
  metaDot: {
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    height: 4,
    width: 4
  },
  metaText: {
    color: Colors.gray500,
    fontSize: 11,
    maxWidth: 100
  },
  expandIndicator: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  // Expanded Section
  expandedSection: {
    borderTopColor: Colors.gray200,
    borderTopWidth: 1,
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md
  },
  expandedBlock: {
    gap: Spacing.sm
  },
  expandedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs
  },
  expandedTitle: {
    color: Colors.gray900,
    flex: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  // Location Grid
  locationGrid: {
    flexDirection: 'row',
    gap: Spacing.md
  },
  locationItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs
  },
  locationIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20
  },
  locationLabel: {
    color: Colors.gray500,
    fontSize: 10,
    textTransform: 'uppercase'
  },
  locationCoords: {
    color: Colors.gray700,
    fontSize: 11
  },
  // Photos Grid (expanded)
  photosGrid: {
    flexDirection: 'row',
    gap: Spacing.sm
  },
  photoLarge: {
    borderRadius: BorderRadius.md,
    flex: 1,
    height: 140,
    overflow: 'hidden',
    position: 'relative'
  },
  photoLargeImage: {
    height: '100%',
    width: '100%'
  },
  photoLargeOverlay: {
    alignItems: 'center',
    backgroundColor: Colors.success + 'CC',
    borderRadius: BorderRadius.sm,
    bottom: Spacing.xs,
    flexDirection: 'row',
    gap: 4,
    left: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    position: 'absolute'
  },
  photoLargeOverlayExit: {
    backgroundColor: Colors.secondary + 'CC'
  },
  photoLargeLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600'
  },
  // Admin Actions
  adminActions: {
    borderTopColor: Colors.gray200,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm
  },
  deleteActionButton: {
    backgroundColor: Colors.dangerLow
  },
  actionButtonTextWarning: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600'
  },
  actionButtonTextDanger: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  // Map Styles
  mapButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4
  },
  mapButtonText: {
    color: Colors.primary,
    fontSize: 11,
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
    borderRadius: BorderRadius.xl,
    elevation: 5,
    maxHeight: '80%',
    overflow: 'hidden',
    ...Shadows.large
  },
  mapModalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.gray200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
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
  exitMarker: {
    opacity: 0.7
  },
  // Photo Modal
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
  fullImage: {
    height: '80%',
    width: '100%'
  },
  closeButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  closeButtonText: {
    color: Colors.gray900,
    fontSize: 16,
    fontWeight: '600'
  }
});
