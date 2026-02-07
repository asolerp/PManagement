import React, { useState } from 'react';
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';
import theme from '../../Theme/Theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Theme/Variables';
import Modal from 'react-native-modal';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {
  getFirestore,
  collection,
  query,
  orderBy
} from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image';
import { DEFAULT_IMAGE } from '../../constants/general';

import { useConfirmEntrance } from './hooks/useConfirmEntrance';
import { Variants } from '../../Theme/Variables';
import { useTheme } from '../../Theme';

const ConfirmEntranceScreen = () => {
  const { Gutters, Layout, Fonts } = useTheme();
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);

  const db = getFirestore();
  const housesQuery = query(
    collection(db, 'houses'),
    orderBy('houseName', 'asc')
  );

  const [houses] = useCollectionData(housesQuery, { idField: 'id' });

  const { onRegisterEnter } = useConfirmEntrance(selectedHouse);

  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        subPage: true
      }}
      footer={
        <CustomButton
          color={Variants.success.color}
          styled="rounded"
          loading={false}
          title={'Registrar entrada'}
          onPress={() => onRegisterEnter()}
        />
      }
    >
      <View
        style={[
          Layout.fill,
          Layout.colCenter,
          Layout.justifyCenter,
          styles.screenContainer
        ]}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.titleText}>Registrar entrada</Text>
          <Text style={styles.subtitleText}>
            Presiona el botón para registrar tu entrada de trabajo
          </Text>

          {/* Selector de casa */}
          <View style={styles.houseSelectorContainer}>
            <Text style={styles.houseSelectorLabel}>Casa (opcional):</Text>
            <TouchableOpacity
              style={[
                styles.houseSelector,
                selectedHouse && styles.houseSelectorSelected
              ]}
              onPress={() => setShowHouseModal(true)}
              activeOpacity={0.7}
            >
              {selectedHouse ? (
                <View style={styles.houseSelectorContent}>
                  <FastImage
                    source={{
                      uri:
                        selectedHouse.houseImage?.small ||
                        selectedHouse.houseImage?.original ||
                        DEFAULT_IMAGE,
                      priority: FastImage.priority.normal
                    }}
                    style={styles.houseSelectorImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.houseSelectorText}>
                    <Text style={styles.houseSelectorName}>
                      {selectedHouse.houseName}
                    </Text>
                    {selectedHouse.street && (
                      <Text style={styles.houseSelectorSubtitle}>
                        {selectedHouse.street}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={e => {
                      e.stopPropagation();
                      setSelectedHouse(null);
                    }}
                    style={styles.clearButton}
                  >
                    <Icon name="close" size={20} color={Colors.gray600} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.houseSelectorContent}>
                  <View style={styles.houseSelectorPlaceholder}>
                    <Icon name="home" size={24} color={Colors.gray600} />
                  </View>
                  <View style={styles.houseSelectorText}>
                    <Text style={styles.houseSelectorPlaceholderText}>
                      Seleccionar casa
                    </Text>
                  </View>
                  <Icon
                    name="arrow-drop-down"
                    size={24}
                    color={Colors.gray600}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de selección de casa */}
      <Modal
        isVisible={showHouseModal}
        onBackdropPress={() => setShowHouseModal(false)}
        onSwipeComplete={() => setShowHouseModal(false)}
        swipeDirection={['down']}
        style={styles.fullScreenModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        propagateSwipe={true}
        scrollTo={null}
        scrollOffset={0}
        scrollOffsetMax={0}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Icon name="home" size={24} color={Colors.primary} />
                <Text style={styles.modalTitle}>Seleccionar casa</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHouseModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={Colors.gray700} />
              </TouchableOpacity>
            </View>

            {houses && houses.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={true}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                bounces={true}
                alwaysBounceVertical={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Opción "Ninguna" */}
                <TouchableOpacity
                  style={[
                    styles.houseOption,
                    !selectedHouse && styles.houseOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedHouse(null);
                    setShowHouseModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.houseOptionContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        !selectedHouse && styles.iconContainerSelected
                      ]}
                    >
                      <Icon
                        name="close"
                        size={20}
                        color={!selectedHouse ? Colors.white : Colors.gray600}
                      />
                    </View>
                    <View style={styles.houseOptionText}>
                      <Text
                        style={[
                          styles.houseName,
                          !selectedHouse && styles.houseNameSelected
                        ]}
                      >
                        Ninguna (opcional)
                      </Text>
                      <Text style={styles.houseSubtitle}>
                        No asignar a ninguna casa
                      </Text>
                    </View>
                    {!selectedHouse && (
                      <Icon
                        name="check-circle"
                        size={24}
                        color={Colors.success}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Lista de casas */}
                {houses.map(house => {
                  const isSelected = selectedHouse?.id === house.id;
                  return (
                    <TouchableOpacity
                      key={house.id}
                      style={[
                        styles.houseOption,
                        isSelected && styles.houseOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedHouse(house);
                        setShowHouseModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.houseOptionContent}>
                        <FastImage
                          source={{
                            uri:
                              house.houseImage?.small ||
                              house.houseImage?.original ||
                              DEFAULT_IMAGE,
                            priority: FastImage.priority.normal
                          }}
                          style={[
                            styles.houseImage,
                            isSelected && styles.houseImageSelected
                          ]}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                        <View style={styles.houseOptionText}>
                          <Text
                            style={[
                              styles.houseName,
                              isSelected && styles.houseNameSelected
                            ]}
                          >
                            {house.houseName}
                          </Text>
                          {house.street && (
                            <Text style={styles.houseSubtitle}>
                              {house.street}
                            </Text>
                          )}
                        </View>
                        {isSelected && (
                          <Icon
                            name="check-circle"
                            size={24}
                            color={Colors.success}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="home" size={48} color={Colors.gray400} />
                <Text style={styles.emptyText}>No hay casas disponibles</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    padding: 4
  },
  closeButton: {
    padding: 4
  },
  contentWrapper: {
    alignItems: 'center',

    width: '100%'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: Colors.gray600,
    fontSize: 16,
    marginTop: 12
  },
  fullScreenModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  houseImage: {
    borderColor: Colors.grey,
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    marginRight: 12,
    width: 48
  },
  houseImageSelected: {
    borderColor: Colors.grey
  },
  houseName: {
    color: Colors.gray900,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  houseNameSelected: {
    color: Colors.success
  },
  houseOption: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.grey,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    overflow: 'hidden'
  },
  houseOptionContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 12
  },
  houseOptionSelected: {
    backgroundColor: Colors.successLow,
    borderColor: Colors.grey
  },
  houseOptionText: {
    flex: 1
  },
  houseSelector: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.grey,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden'
  },
  houseSelectorContainer: {
    marginTop: 24,
    width: '100%'
  },
  houseSelectorContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 12
  },
  houseSelectorImage: {
    borderColor: Colors.grey,
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    marginRight: 12,
    width: 48
  },
  houseSelectorLabel: {
    color: Colors.gray700,
    fontSize: 14,
    marginBottom: 8
  },
  houseSelectorName: {
    color: Colors.gray900,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  houseSelectorPlaceholder: {
    alignItems: 'center',
    backgroundColor: Colors.gray200,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48
  },
  houseSelectorPlaceholderText: {
    color: Colors.gray600,
    fontSize: 16
  },
  houseSelectorSelected: {
    backgroundColor: Colors.successLow
  },
  houseSelectorSubtitle: {
    color: Colors.gray600,
    fontSize: 13
  },
  houseSelectorText: {
    flex: 1
  },
  houseSubtitle: {
    color: Colors.gray600,
    fontSize: 13
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray200,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48
  },
  iconContainerSelected: {
    backgroundColor: Colors.success
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    overflow: 'hidden'
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.grey,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20
  },
  modalHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  modalTitle: {
    color: Colors.gray900,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8
  },
  safeArea: {
    backgroundColor: Colors.white,
    flex: 1
  },
  screenContainer: {
    paddingVertical: 16
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  scrollView: {
    flex: 1,
    flexGrow: 1
  },
  subtitleText: {
    color: Colors.gray600,
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center'
  },
  titleText: {
    color: Colors.gray900,
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  }
});

export default ConfirmEntranceScreen;
