import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-viewing';
import { Colors } from '../../Theme/Variables';

export const OwnerChecks = ({ checklist, checksFromChecklist }) => {
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [viewerImages, setViewerImages] = React.useState([]);
  const [viewerIndex, setViewerIndex] = React.useState(0);

  const openPhoto = (photos, index) => {
    setViewerImages(photos.map(uri => ({ uri })));
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const hasChecks = checksFromChecklist?.length > 0;

  return (
    <>
      <ImageView
        visible={viewerVisible}
        imageIndex={viewerIndex}
        images={viewerImages}
        onRequestClose={() => setViewerVisible(false)}
      />

      {/* Lista de ítems revisados */}
      {hasChecks && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Revisamos</Text>
          <View style={styles.checkList}>
            {checksFromChecklist.map((check, idx) => {
              const photos = check?.photos || [];
              const isLast = idx === checksFromChecklist.length - 1;

              return (
                <View key={check.id} style={styles.checkItem}>
                  {/* Línea vertical conectora */}
                  {!isLast && <View style={styles.connector} />}

                  {/* Bullet con check */}
                  <View style={styles.checkBullet}>
                    <Icon name="check" size={14} color={Colors.white} />
                  </View>

                  {/* Contenido */}
                  <View style={styles.checkContent}>
                    <Text style={styles.checkName}>
                      {check.locale?.es || check.locale?.en || ''}
                    </Text>

                    {/* Fotos en tira horizontal */}
                    {photos.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.photosStrip}
                        contentContainerStyle={styles.photosStripContent}
                      >
                        {photos.map((photo, photoIdx) => (
                          <TouchableOpacity
                            key={`${photo}-${photoIdx}`}
                            onPress={() => openPhoto(photos, photoIdx)}
                            activeOpacity={0.85}
                          >
                            <FastImage
                              source={{
                                uri: photo,
                                priority: FastImage.priority.normal
                              }}
                              style={styles.photo}
                              resizeMode={FastImage.resizeMode.cover}
                            />
                            <View style={styles.photoOverlay}>
                              <Icon name="zoom-in" size={16} color={Colors.white} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Observaciones */}
      <View style={styles.observationsSection}>
        <View style={styles.observationsHeader}>
          <Icon name="notes" size={15} color={Colors.gray500} />
          <Text style={styles.sectionLabel}>Observaciones</Text>
        </View>
        {checklist?.observations ? (
          <Text style={styles.observationsText}>{checklist.observations}</Text>
        ) : (
          <Text style={styles.observationsEmpty}>Sin observaciones registradas</Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  checkBullet: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 24,
    zIndex: 1
  },
  checkContent: {
    flex: 1,
    marginLeft: 36,
    paddingBottom: 16
  },
  checkItem: {
    paddingLeft: 0,
    position: 'relative'
  },
  checkList: {
    marginTop: 8
  },
  checkName: {
    color: Colors.gray700,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    paddingTop: 2
  },
  connector: {
    backgroundColor: Colors.gray200,
    bottom: 0,
    left: 11,
    position: 'absolute',
    top: 24,
    width: 2
  },
  observationsEmpty: {
    color: Colors.gray400,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6
  },
  observationsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2
  },
  observationsSection: {
    borderTopColor: Colors.gray100,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 16
  },
  observationsText: {
    color: Colors.gray600,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  photo: {
    borderRadius: 8,
    height: 72,
    width: 72
  },
  photoOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  photosStrip: {
    marginTop: 8
  },
  photosStripContent: {
    gap: 6,
    paddingRight: 4
  },
  section: {
    marginBottom: 4
  },
  sectionLabel: {
    color: Colors.gray500,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  }
});
