import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import { format } from 'date-fns';
import Badge from '../../components/Elements/Badge';
import Avatar from '../../components/Avatar';
import { DEFAULT_IMAGE } from '../../constants/general';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-viewing';
import { Colors } from '../../Theme/Variables';
import { useTheme } from '../../Theme';

const EntranceDetailScreen = () => {
  const route = useRoute();
  const { entrance } = route.params || {};
  const { Gutters, Layout, Fonts } = useTheme();
  const [imageViewModal, setImageViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);

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

  const handleImagePress = imageUri => {
    if (imageUri) {
      setSelectedImage([{ uri: imageUri }]);
      setImageViewModal(true);
    }
  };

  if (!entrance) {
    return (
      <PageLayout safe backButton>
        <View style={[Layout.fill, Layout.colCenter, Layout.justifyCenter]}>
          <Text style={[Fonts.textRegular, theme.textGray600]}>
            No se encontró información de la entrada
          </Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <>
      <ImageView
        visible={imageViewModal}
        imageIndex={0}
        images={selectedImage}
        onRequestClose={() => setImageViewModal(false)}
      />
      <PageLayout safe backButton titleProps={{ subPage: true }}>
        <ScrollView
          style={Layout.fill}
          contentContainerStyle={[Gutters.smallVPadding]}
          showsVerticalScrollIndicator={false}
        >
          {/* Información del trabajador */}
          <View style={[theme.bgWhite, theme.roundedLg, theme.shadowXl]}>
            <View style={[Layout.row, Layout.itemsCenter]}>
              <Avatar
                uri={entrance.worker?.profileImage?.small || DEFAULT_IMAGE}
                size="big"
              />
              <View style={[Layout.grow, Gutters.smallLMargin]}>
                <Text
                  style={[Fonts.textBold, Fonts.textLarge, theme.textBlack]}
                >
                  {entrance.worker?.firstName} {entrance.worker?.secondName}
                </Text>
                <Text
                  style={[
                    Fonts.textRegular,
                    theme.textGray600,
                    Gutters.tinyTMargin
                  ]}
                >
                  {entrance.worker?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Estado y casa */}
          <View
            style={[
              theme.bgWhite,
              theme.mX3,
              theme.mT2,
              theme.pY3,
              theme.roundedLg,
              theme.shadowXl
            ]}
          >
            <View
              style={[
                Layout.row,
                Layout.itemsCenter,
                Gutters.smallBMargin,
                Layout.flexWrap
              ]}
            >
              <Badge
                type="outline"
                variant={entrance.exitDate ? 'success' : 'warning'}
                text={entrance.exitDate ? 'Finalizado' : 'En curso'}
              />
              {entrance.house && (
                <>
                  <View style={theme.w2} />
                  <Badge
                    type="outline"
                    variant="purple"
                    text={entrance.house.houseName}
                  />
                </>
              )}
            </View>

            {/* Horas */}
            <View
              style={[Layout.row, Layout.itemsCenter, Gutters.smallTMargin]}
            >
              <Text
                style={[Fonts.textRegular, theme.textGray700, styles.timeLabel]}
              >
                🕒 Entrada:{' '}
              </Text>
              <View style={styles.badgeWrapper}>
                <Badge
                  variant="success"
                  type="outline"
                  text={
                    format(
                      new Date(
                        entrance?.date?.seconds * 1000 +
                          (entrance?.date?.nanoseconds || 0) / 1000000
                      ),
                      'HH:mm'
                    ) + 'h'
                  }
                />
              </View>
            </View>

            {entrance.exitDate && (
              <View
                style={[Layout.row, Layout.itemsCenter, Gutters.smallTMargin]}
              >
                <Text
                  style={[
                    Fonts.textRegular,
                    theme.textGray700,
                    styles.timeLabel
                  ]}
                >
                  🕒 Salida:{' '}
                </Text>
                <View style={styles.badgeWrapper}>
                  <Badge
                    type="outline"
                    variant="danger"
                    text={
                      format(
                        new Date(
                          entrance?.exitDate?.seconds * 1000 +
                            (entrance?.exitDate?.nanoseconds || 0) / 1000000
                        ),
                        'HH:mm'
                      ) + 'h'
                    }
                  />
                </View>
              </View>
            )}

            {/* Fecha completa */}
            <View style={Gutters.smallTMargin}>
              <Text style={[Fonts.textRegular, theme.textGray600]}>
                Fecha:{' '}
                {format(
                  new Date(
                    entrance?.date?.seconds * 1000 +
                      (entrance?.date?.nanoseconds || 0) / 1000000
                  ),
                  'dd/MM/yyyy'
                )}
              </Text>
            </View>
          </View>

          {/* Fotos */}
          {(entrance.images?.[0]?.url ||
            entrance.images?.[1]?.url ||
            entrance.photos?.[0] ||
            entrance.photos?.[1]) && (
            <View
              style={[
                theme.bgWhite,
                theme.mX3,
                theme.mT2,
                theme.pY3,
                theme.roundedLg,
                theme.shadowXl
              ]}
            >
              <Text
                style={[
                  Fonts.textBold,
                  Fonts.textRegular,
                  Gutters.smallBMargin,
                  styles.sectionTitle
                ]}
              >
                Fotos
              </Text>
              <View style={styles.photosContainer}>
                {(entrance.images?.[0]?.url || entrance.photos?.[0]) && (
                  <TouchableOpacity
                    onPress={() =>
                      handleImagePress(
                        entrance.images?.[0]?.url || entrance.photos?.[0]
                      )
                    }
                    style={[
                      styles.photoContainer,
                      (entrance.images?.[1]?.url || entrance.photos?.[1]) &&
                        styles.photoContainerLeft
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.photoWrapper}>
                      <FastImage
                        style={styles.photoPreview}
                        source={{
                          uri: entrance.images?.[0]?.url || entrance.photos?.[0]
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoLabel}>Entrada</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {(entrance.images?.[1]?.url || entrance.photos?.[1]) && (
                  <TouchableOpacity
                    onPress={() =>
                      handleImagePress(
                        entrance.images?.[1]?.url || entrance.photos?.[1]
                      )
                    }
                    style={[
                      styles.photoContainer,
                      (entrance.images?.[0]?.url || entrance.photos?.[0]) &&
                        styles.photoContainerRight
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.photoWrapper}>
                      <FastImage
                        style={styles.photoPreview}
                        source={{
                          uri: entrance.images?.[1]?.url || entrance.photos?.[1]
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoLabel}>Salida</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Mapa */}
          <View
            style={[
              theme.bgWhite,
              theme.mX3,
              theme.mT2,
              theme.mB3,
              theme.roundedLg,
              theme.shadowXl,
              theme.overflowHidden
            ]}
          >
            <Text
              style={[
                Fonts.textBold,
                Fonts.textRegular,
                theme.pY4,
                Gutters.smallBMargin,
                styles.sectionTitle
              ]}
            >
              Ubicación
            </Text>
            <MapView
              style={styles.map}
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
                      uri={
                        entrance.worker?.profileImage?.small || DEFAULT_IMAGE
                      }
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
                      uri={
                        entrance.worker?.profileImage?.small || DEFAULT_IMAGE
                      }
                      size="medium"
                    />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>
        </ScrollView>
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  exitMarker: {
    opacity: 0.7
  },
  map: {
    height: 300,
    width: '100%'
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
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
    height: 200,
    width: '100%'
  },
  photoWrapper: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
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
  sectionTitle: {
    color: Colors.gray900,
    fontSize: 18
  },
  timeLabel: {
    alignSelf: 'center'
  }
});

export default EntranceDetailScreen;
