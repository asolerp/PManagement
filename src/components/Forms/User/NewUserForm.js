import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Theme/Theme';
// Redux

import {CustomSelect} from '../../CustomSelect';
import {CustomPicker} from '../../CustomPicker';
import {useTheme} from '../../../Theme';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {useNewUser} from './hooks/useNewUser';
import {TextInputController} from '../TextInputController';
import {Spacer} from '../../Elements/Spacer';

export const roleOptions = [
  {label: '', value: ''},
  {label: 'Administrador', value: 'admin'},
  {label: 'Trabajador', value: 'worker'},
  {label: 'Propietario', value: 'owner'},
];

export const languageOptions = [
  {label: '', value: ''},
  {label: 'Español', value: 'es'},
  {label: 'Inglés', value: 'en'},
];

export const genderOptions = [
  {label: '', value: ''},
  {label: 'Masculino', value: 'male'},
  {label: 'Femenino', value: 'female'},
];

const defaultImg =
  'https://res.cloudinary.com/enalbis/image/upload/v1645959807/PortManagement/varios/Captura_de_pantalla_2022-02-27_a_las_12.02.44_vttcma.jpg';

const NewUserForm = ({
  user,
  watch,
  errors,
  control,
  register,
  newImage,
  setValue,
  setNewImage,
}) => {
  const {Gutters, Layout} = useTheme();
  const {t} = useTranslation();
  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);

  const [watches, setWatches] = useState({});

  const {handlePressImage} = useNewUser(setNewImage);

  useEffect(() => {
    const subscription = watch((value) => setWatches(value));
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <KeyboardAvoidingView
      style={[Gutters.mediumTMargin]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <CustomPicker
        register={register('role', {required: true})}
        isPickerVisible={isPickerVisibleRole}
        closePicker={() => setIsPickerVisibleRole(false)}
        value={user?.role}
        setValue={(role) => {
          setValue('role', role, {shouldValidate: true});
        }}
        options={roleOptions}
      />
      <CustomPicker
        register={register('gender', {required: true})}
        isPickerVisible={isPickerVisibleGender}
        closePicker={() => setIsPickerVisibleGender(false)}
        value={user?.gender}
        setValue={(gender) => {
          setValue('gender', gender, {shouldValidate: true});
        }}
        options={genderOptions}
      />
      <CustomPicker
        register={register('language', {required: true})}
        isPickerVisible={isPickerVisibleLanguage}
        closePicker={() => setIsPickerVisibleLanguage(false)}
        value={user?.language}
        setValue={(language) => {
          setValue('language', language, {shouldValidate: true});
        }}
        options={languageOptions}
      />
      <View style={[Layout.alignItemsCenter, Gutters.regularBMargin]}>
        <TouchableOpacity onPress={() => handlePressImage('library')}>
          {newImage?.[0]?.fileUri && (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={() => {
                  setNewImage(null);
                }}>
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          <ImageBlurLoading
            withIndicator
            thumbnailSource={{
              uri: newImage?.[0]?.fileUri || user?.profileImage,
            }}
            source={{
              uri: newImage?.[0]?.fileUri || user?.profileImage || defaultImg,
            }}
            style={styles.avatarWrapper}
          />
        </TouchableOpacity>
      </View>
      <TextInputController
        placeholder={t('newUser.form.name')}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="name"
      />
      <Spacer space={2} />
      <TextInputController
        placeholder={t('newUser.form.surname')}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="surname"
      />
      <Spacer space={2} />
      <TextInputController
        placeholder={t('newUser.form.email')}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="email"
      />
      <Spacer space={2} />
      <TextInputController
        placeholder={t('newUser.form.phone')}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="phone"
      />
      <Spacer space={2} />
      <CustomSelect
        placeHolder={t('newUser.form.role')}
        value={
          watches?.role &&
          roleOptions?.find((r) => r.value === watches?.role).label
        }
        onPress={() => setIsPickerVisibleRole(true)}
      />
      {errors.role && (
        <Text style={[theme.mY2, theme.textErrorDark]}>
          El campo es requerido.
        </Text>
      )}
      <Spacer space={2} />
      <CustomSelect
        placeHolder={t('newUser.form.gender')}
        value={
          watches?.gender &&
          genderOptions?.find((r) => r.value === watches?.gender).label
        }
        onPress={() => setIsPickerVisibleGender(true)}
      />
      {errors.gender && (
        <Text style={[theme.mY2, theme.textErrorDark]}>
          El campo es requerido.
        </Text>
      )}
      <Spacer space={2} />
      <CustomSelect
        placeHolder={t('newUser.form.language')}
        value={
          watches?.language &&
          languageOptions?.find((r) => r.value === watches?.language).label
        }
        onPress={() => setIsPickerVisibleLanguage(true)}
      />
      {errors.language && (
        <Text style={[theme.mY2, theme.textErrorDark]}>
          El campo es requerido.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 5,
  },
});

export default NewUserForm;
