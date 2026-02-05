import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';

// UI
import Icon from 'react-native-vector-icons/MaterialIcons';
import InputGroup from '../../components/Elements/InputGroup';
import PageLayout from '../../components/PageLayout';
import DynamicSelectorList from '../../components/DynamicSelectorList';
import CustomButton from '../../components/Elements/CustomButton';
import { BottomModal } from '../../components/Modals/BottomModal';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import PageOptionsScreen from '../PageOptions/PageOptions';
import FastImage from 'react-native-fast-image';

import { DEFAULT_IMAGE } from '../../constants/general';
import { useHouseScreen } from './useHouseScreen';

// Componente para la imagen de la casa
const HouseImageSection = ({
  isAdmin,
  newImage,
  infoHouse,
  handlePressImage,
  setNewImage
}) => (
  <TouchableOpacity
    onPress={() => isAdmin && handlePressImage('library')}
    activeOpacity={0.8}
    disabled={!isAdmin}
  >
    {newImage && (
      <View style={styles.removeImageButton}>
        <TouchableOpacity
          onPress={() => setNewImage(null)}
          style={styles.removeImageTouchable}
        >
          <Icon name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    )}
    <View style={styles.imageCard}>
      {!newImage?.[0]?.fileUri && !infoHouse?.houseImage?.original ? (
        <View style={styles.emptyImageContent}>
          <View style={styles.emptyImageIconWrapper}>
            <Icon name="add-a-photo" size={32} color="#55A5AD" />
          </View>
          <Text style={styles.emptyImageText}>
            {isAdmin ? 'Toca para añadir una foto' : 'Sin foto'}
          </Text>
        </View>
      ) : (
        <FastImage
          style={styles.houseImage}
          source={{
            uri:
              newImage?.[0]?.fileUri ||
              infoHouse?.houseImage?.original ||
              DEFAULT_IMAGE,
            priority: FastImage.priority.normal
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
    </View>
  </TouchableOpacity>
);

// Componente para el campo de información del propietario
const OwnerInfoSection = ({ owner, isAdmin, onPress, t }) => (
  <View style={styles.ownerSection}>
    <Text style={styles.sectionTitle}>{t('common.owner')}</Text>

    <TouchableOpacity
      style={styles.ownerCard}
      onPress={onPress}
      disabled={!isAdmin}
      activeOpacity={0.7}
    >
      <View style={styles.ownerCardContent}>
        <View style={styles.ownerIconWrapper}>
          <Icon name="person" size={24} color="#55A5AD" />
        </View>
        <View style={styles.ownerInfo}>
          <Text style={styles.ownerLabel}>Propietario</Text>
          <Text style={styles.ownerName}>
            {owner?.firstName} {owner?.lastName}
          </Text>
          {owner?.phone && (
            <View style={styles.ownerPhoneContainer}>
              <Icon name="phone" size={14} color="#718096" />
              <Text style={styles.ownerPhone}>{owner.phone}</Text>
            </View>
          )}
        </View>
        {isAdmin && <Icon name="chevron-right" size={24} color="#CBD5E0" />}
      </View>
    </TouchableOpacity>
  </View>
);

// Componente para el campo de entrada
const FormField = ({ label, value, onChangeText, placeholder, editable }) => (
  <View style={styles.formField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <InputGroup>
      <TextInput
        editable={editable}
        style={styles.textInput}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        placeholderTextColor="#A0AEC0"
      />
    </InputGroup>
  </View>
);

const HouseScreen = ({ route }) => {
  const { t } = useTranslation();
  const {
    house,
    isAdmin,
    houseId,
    newImage,
    infoHouse,
    handleEdit,
    setNewImage,
    setInfoHouse,
    modalVisible,
    setModalVisible,
    handlePressImage
  } = useHouseScreen({ route });

  const hasChanges = Boolean(infoHouse || newImage);
  const owner = infoHouse?.owner || house?.owner;

  return (
    <>
      <BottomModal
        isFixedBottom={false}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        swipeDirection={null}
      >
        <DynamicSelectorList
          collection="users"
          order={{ field: 'firstName' }}
          where={[
            {
              label: 'role',
              operator: '==',
              condition: 'owner'
            }
          ]}
          store="jobForm"
          searchBy="firstName"
          schema={{
            img: 'profileImage',
            name: 'firstName',
            lastname: 'lastName'
          }}
          get={[owner]}
          set={owners => setInfoHouse({ ...infoHouse, owner: owners[0] })}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>

      <PageLayout
        safe
        backButton
        titleRightSide={
          <PageOptionsScreen
            editable={false}
            collection={'houses'}
            docId={houseId}
            showDelete={true}
            duplicate={false}
          />
        }
      >
        {house ? (
          <KeyboardAwareScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.headerContainer}>
              <ScreenHeader title={house?.houseName} />
            </View>

            <HouseImageSection
              isAdmin={isAdmin}
              newImage={newImage}
              infoHouse={infoHouse}
              handlePressImage={handlePressImage}
              setNewImage={setNewImage}
            />

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>{t('houses.house_data')}</Text>

              <FormField
                label={t('houses.house_name')}
                value={infoHouse?.houseName}
                onChangeText={text =>
                  setInfoHouse({ ...infoHouse, houseName: text })
                }
                placeholder={t('houses.house_name')}
                editable={isAdmin}
              />

              <FormField
                label={t('houses.house_address')}
                value={infoHouse?.street}
                onChangeText={text =>
                  setInfoHouse({ ...infoHouse, street: text })
                }
                placeholder={t('houses.house_address')}
                editable={isAdmin}
              />

              <FormField
                label={t('houses.house_municipality')}
                value={infoHouse?.municipio}
                onChangeText={text =>
                  setInfoHouse({ ...infoHouse, municipio: text })
                }
                placeholder={t('houses.house_municipality')}
                editable={isAdmin}
              />

              <OwnerInfoSection
                owner={owner}
                isAdmin={isAdmin}
                onPress={() => isAdmin && setModalVisible(true)}
                t={t}
              />

              {hasChanges && isAdmin && (
                <View style={styles.saveButtonWrapper}>
                  <CustomButton
                    title={t('common.save') || 'Guardar'}
                    onPress={handleEdit}
                  />
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
        ) : (
          <View style={styles.emptyContainer} />
        )}
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 24
  },
  headerContainer: {
    marginBottom: 20
  },
  // Image Section
  imageCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    height: 200,
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden'
  },
  houseImage: {
    borderRadius: 16,
    height: '100%',
    width: '100%'
  },
  emptyImageContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyImageIconWrapper: {
    alignItems: 'center',
    backgroundColor: '#E6F7F8',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 12,
    width: 80
  },
  emptyImageText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500'
  },
  removeImageButton: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 20,
    elevation: 3,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: 8,
    width: 36,
    zIndex: 10
  },
  removeImageTouchable: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },
  // Form Section
  formContainer: {
    gap: 20
  },
  sectionTitle: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  formField: {
    marginBottom: 4
  },
  fieldLabel: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  textInput: {
    color: '#2D3748',
    fontSize: 15,
    height: 44
  },
  // Owner Section
  ownerSection: {
    marginTop: 8
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden'
  },
  ownerCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16
  },
  ownerIconWrapper: {
    alignItems: 'center',
    backgroundColor: '#E6F7F8',
    borderRadius: 28,
    height: 48,
    justifyContent: 'center',
    marginRight: 16,
    width: 48
  },
  ownerInfo: {
    flex: 1
  },
  ownerLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4
  },
  ownerName: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  ownerPhoneContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2
  },
  ownerPhone: {
    color: '#718096',
    fontSize: 14,
    marginLeft: 6
  },
  // Save Button
  saveButtonWrapper: {
    marginTop: 24
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});

export default HouseScreen;
