import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from 'react-native';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

// Components
import DynamicSelectorList from '../../DynamicSelectorList';
import CustomButton from '../../Elements/CustomButton';
import { BottomModal } from '../../Modals/BottomModal';
import { TextInputController } from '../TextInputController';

// Firebase
import { newHouse } from '../../../firebase/uploadNewHouse';

// Utils
import { error } from '../../../lib/logging';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import { useCameraOrLibrary } from '../../../hooks/useCamerOrLibrary';
import { imageActions } from '../../../utils/imageActions';
import useUploadImageCheck from '../../../hooks/useUploadImage';
import { HOUSES } from '../../../utils/firebaseKeys';

// Theme
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadows
} from '../../../Theme/Variables';

const LIBRARY_ACTION = 'library';

// ============================================
// Sub-components
// ============================================

const SectionTitle = ({ icon, title }) => (
  <View style={styles.sectionTitle}>
    <View style={styles.sectionIcon}>
      <Icon name={icon} size={18} color={Colors.white} />
    </View>
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const ImagePicker = ({ image, onPress }) => {
  const { t } = useTranslation();
  const hasImage = image && image.length > 0;

  return (
    <TouchableOpacity
      style={[styles.imagePicker, hasImage && styles.imagePickerWithImage]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {hasImage ? (
        <>
          <Image
            source={{ uri: image[0].fileUri }}
            style={styles.imagePreview}
          />
          <View style={styles.imageOverlay}>
            <Icon name="edit" size={24} color={Colors.white} />
            <Text style={styles.imageOverlayText}>{t('common.edit')}</Text>
          </View>
        </>
      ) : (
        <View style={styles.imagePlaceholder}>
          <View style={styles.imageIconCircle}>
            <Icon name="add-a-photo" size={28} color={Colors.white} />
          </View>
          <Text style={styles.imagePlaceholderTitle}>
            {t('houses.addPhoto')}
          </Text>
          <Text style={styles.imagePlaceholderSubtitle}>
            {t('houses.addPhotoHint')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const OwnerSelector = ({ owner, onPress }) => {
  const { t } = useTranslation();
  const hasOwner = owner && owner.length > 0;

  return (
    <TouchableOpacity
      style={styles.ownerSelector}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ownerContent}>
        <View style={styles.ownerIcon}>
          <Icon name="person" size={20} color={Colors.white} />
        </View>
        <View style={styles.ownerInfo}>
          <Text style={styles.ownerLabel}>{t('common.owner')}</Text>
          {hasOwner ? (
            <Text style={styles.ownerName}>
              {owner[0]?.firstName} {owner[0]?.lastName}
            </Text>
          ) : (
            <Text style={styles.ownerPlaceholder}>
              {t('houses.selectOwner')}
            </Text>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.gray400} />
    </TouchableOpacity>
  );
};

// ============================================
// Main Component
// ============================================

const NewFormHome = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [owner, setOwner] = useState([]);
  const { uploadImages } = useUploadImageCheck(HOUSES);

  const [modalVisible, setModalVisible] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      houseName: '',
      street: '',
      municipio: '',
      cp: '',
      phone: ''
    }
  });

  const [houseImage, setHouseImage] = useState();
  const [loading, setLoading] = useState(false);

  const { onImagePress } = useCameraOrLibrary();

  const handlePress = type => {
    onImagePress({
      type,
      options: { ...imageActions[type], selectionLimit: 1 },
      callback: async imgs => {
        setHouseImage(
          imgs.map((image, i) => ({
            fileBase64: image?.base64,
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type
          }))
        );
      }
    });
  };

  const onSubmit = async data => {
    setLoading(true);
    setVisible(true);
    try {
      const houseId = await newHouse({ ...data, owner: owner[0] });
      await uploadImages(houseImage, null, houseId);
      reset();
      setHouseImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setLoading(false);
      setVisible(false);
      navigation.goBack();
    }
  };

  return (
    <>
      {/* Owner Selection Modal */}
      <BottomModal
        isFixedBottom={false}
        isVisible={modalVisible}
        swipeDirection={null}
        onClose={() => setModalVisible(false)}
      >
        <DynamicSelectorList
          order={{ field: 'firstName' }}
          collection="users"
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
          get={owner}
          set={owners => setOwner(owners)}
          closeModal={() => setModalVisible(false)}
        />
      </BottomModal>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Picker */}
        <ImagePicker
          image={houseImage}
          onPress={() => handlePress(LIBRARY_ACTION)}
        />

        {/* Basic Info Section */}
        <SectionTitle icon="home" title={t('houses.basicInfo')} />
        <View style={styles.card}>
          <TextInputController
            control={control}
            errors={errors}
            name="houseName"
            placeholder={t('houses.houseName')}
            rules={{ required: true }}
          />
        </View>

        {/* Address Section */}
        <SectionTitle icon="location-on" title={t('houses.address')} />
        <View style={styles.card}>
          <TextInputController
            control={control}
            errors={errors}
            name="street"
            placeholder={t('houses.street')}
            rules={{ required: true }}
          />
          <View style={styles.inputSpacer} />
          <TextInputController
            control={control}
            errors={errors}
            name="municipio"
            placeholder={t('houses.city')}
            rules={{ required: true }}
          />
          <View style={styles.inputSpacer} />
          <View style={styles.rowInputs}>
            <View style={styles.rowInputLeft}>
              <TextInputController
                control={control}
                errors={errors}
                name="cp"
                placeholder={t('houses.postalCode')}
                rules={{ required: true }}
              />
            </View>
            <View style={styles.rowInputRight}>
              <TextInputController
                control={control}
                errors={errors}
                name="phone"
                placeholder={t('houses.phone')}
                rules={{ required: true }}
              />
            </View>
          </View>
        </View>

        {/* Owner Section */}
        <SectionTitle icon="person" title={t('common.owner')} />
        <OwnerSelector owner={owner} onPress={() => setModalVisible(true)} />

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <CustomButton
          loading={loading}
          title={t('houses.createHouse')}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  bottomSpacer: {
    height: Spacing.xl
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    ...Shadows.sm
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.gray100,
    borderTopWidth: 1,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md
  },
  imageIconCircle: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 56,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: 56
  },
  imageOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.xl,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  imageOverlayText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs
  },
  imagePicker: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 180,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden'
  },
  imagePickerWithImage: {
    borderStyle: 'solid',
    borderWidth: 0
  },
  imagePlaceholder: {
    alignItems: 'center'
  },
  imagePlaceholderSubtitle: {
    color: Colors.gray400,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs
  },
  imagePlaceholderTitle: {
    color: Colors.gray600,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium
  },
  imagePreview: {
    borderRadius: BorderRadius.xl,
    height: '100%',
    width: '100%'
  },
  inputSpacer: {
    height: Spacing.md
  },
  ownerContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  },
  ownerIcon: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 44,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 44
  },
  ownerInfo: {
    flex: 1
  },
  ownerLabel: {
    color: Colors.gray500,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: 2
  },
  ownerName: {
    color: Colors.gray800,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium
  },
  ownerPlaceholder: {
    color: Colors.gray400,
    fontSize: FontSize.base
  },
  ownerSelector: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    ...Shadows.sm
  },
  rowInputLeft: {
    flex: 1,
    marginRight: Spacing.sm
  },
  rowInputRight: {
    flex: 1,
    marginLeft: Spacing.sm
  },
  rowInputs: {
    flexDirection: 'row'
  },
  scrollContent: {
    paddingBottom: Spacing.base
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 28,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 28
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.md
  },
  sectionTitleText: {
    color: Colors.gray700,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold
  }
});

export default NewFormHome;
