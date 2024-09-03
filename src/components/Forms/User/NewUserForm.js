import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
  Text
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Theme/Theme';
// Redux

import { CustomSelect } from '../../CustomSelect';
import { CustomPicker } from '../../CustomPicker';
import { useTheme } from '../../../Theme';
import ImageBlurLoading from 'react-native-image-blur-loading';
import { useNewUser } from './hooks/useNewUser';
import { TextInputController } from '../TextInputController';
import { Spacer } from '../../Elements/Spacer';

export const roleOptions = [
  { label: '', value: '' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Trabajador', value: 'worker' },
  { label: 'Propietario', value: 'owner' }
];

export const languageOptions = [
  { label: '', value: '' },
  { label: 'Español', value: 'es' },
  { label: 'Inglés', value: 'en' }
];

export const genderOptions = [
  { label: '', value: '' },
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' }
];

const defaultImg =
  'https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fport.png?alt=media&token=41156ea7-76a2-4a28-8625-27f779433b78';

const NewUserForm = ({
  user,
  watch,
  errors,
  register,
  newImage,
  setValue,
  setNewImage
}) => {
  const nameRef = useRef(null);
  const surnameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const { Gutters, Layout } = useTheme();
  const { t } = useTranslation();
  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);

  const [watches, setWatches] = useState({});

  const { handlePressImage } = useNewUser(setNewImage);

  React.useEffect(() => {
    register(nameRef.current, { required: true });
    register(surnameRef.current, { required: true });
    register(emailRef.current, { required: true });
    register(phoneRef.current, { required: true });
  }, [register]);

  useEffect(() => {
    const subscription = watch(value => setWatches(value));
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <KeyboardAvoidingView
      style={Gutters.mediumTMargin}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomPicker
        register={register('role', { required: true })}
        isPickerVisible={isPickerVisibleRole}
        closePicker={() => setIsPickerVisibleRole(false)}
        value={user?.role}
        setValue={role => {
          setValue('role', role, { shouldValidate: true });
        }}
        options={roleOptions}
      />
      <CustomPicker
        register={register('gender', { required: true })}
        isPickerVisible={isPickerVisibleGender}
        closePicker={() => setIsPickerVisibleGender(false)}
        value={user?.gender}
        setValue={gender => {
          setValue('gender', gender, { shouldValidate: true });
        }}
        options={genderOptions}
      />
      <CustomPicker
        register={register('language', { required: true })}
        isPickerVisible={isPickerVisibleLanguage}
        closePicker={() => setIsPickerVisibleLanguage(false)}
        value={user?.language}
        setValue={language => {
          setValue('language', language, { shouldValidate: true });
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
                }}
              >
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={[
              theme.p2,
              theme.border1,
              theme.borderGray400,
              theme.roundedFull
            ]}
          >
            <ImageBlurLoading
              withIndicator
              thumbnailSource={{
                uri: newImage?.[0]?.fileUri
              }}
              source={{
                uri: newImage?.[0]?.fileUri || defaultImg
              }}
              style={styles.avatarWrapper}
            />
          </View>
        </TouchableOpacity>
      </View>
      <TextInputController
        ref={nameRef}
        placeholder={t('newUser.form.name')}
        rules={{
          required: true
        }}
        setValue={setValue}
        errors={errors}
        name="name"
      />
      <Spacer space={2} />
      <TextInputController
        ref={surnameRef}
        placeholder={t('newUser.form.surname')}
        rules={{
          required: true
        }}
        setValue={setValue}
        errors={errors}
        name="surname"
      />
      <Spacer space={2} />
      <TextInputController
        ref={emailRef}
        placeholder={t('newUser.form.email')}
        rules={{
          required: true
        }}
        setValue={setValue}
        errors={errors}
        name="email"
      />
      <Spacer space={2} />
      <TextInputController
        ref={phoneRef}
        placeholder={t('newUser.form.phone')}
        rules={{
          required: true
        }}
        setValue={setValue}
        errors={errors}
        name="phone"
      />
      <Spacer space={2} />
      <CustomSelect
        placeHolder={t('newUser.form.role')}
        value={
          watches?.role &&
          roleOptions?.find(r => r.value === watches?.role).label
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
          genderOptions?.find(r => r.value === watches?.gender).label
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
          languageOptions?.find(r => r.value === watches?.language).label
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
    borderRadius: 100,

    height: 150,
    width: 150
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    padding: 5,
    position: 'absolute',
    right: 20,
    top: 0,
    zIndex: 5
  }
});

export default NewUserForm;
