import React, {useEffect, useState} from 'react';
import {
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import InputGroup from '../../Elements/InputGroup';

// Redux
import {Colors} from '../../../Theme/Variables';
import {CustomSelect} from '../../CustomSelect';
import {CustomPicker} from '../../CustomPicker';
import {useTheme} from '../../../Theme';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {useNewUser} from './hooks/useNewUser';

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

const NewUserForm = ({user, setUser, newImage, setNewImage}) => {
  const {Gutters, Layout} = useTheme();
  const {t} = useTranslation();
  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);

  const {handlePressImage} = useNewUser(setNewImage);

  return (
    <KeyboardAvoidingView
      style={[Gutters.mediumTMargin]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <CustomPicker
        isPickerVisible={isPickerVisibleRole}
        closePicker={() => setIsPickerVisibleRole(false)}
        value={user?.role}
        setValue={(role) => {
          setUser({...user, role: role});
        }}
        options={roleOptions}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleGender}
        closePicker={() => setIsPickerVisibleGender(false)}
        value={user?.gender}
        setValue={(gender) => {
          setUser({...user, gender: gender});
        }}
        options={genderOptions}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleLanguage}
        closePicker={() => setIsPickerVisibleLanguage(false)}
        value={user?.language}
        setValue={(language) => {
          setUser({...user, language: language});
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
      <InputGroup>
        <TextInput
          style={{height: 40}}
          placeholder={t('newUser.form.name')}
          placeholderTextColor={Colors.darkGrey}
          onChangeText={(text) => setUser({...user, firstName: text})}
          value={user?.firstName}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          style={{height: 40}}
          placeholder={t('newUser.form.surname')}
          placeholderTextColor={Colors.darkGrey}
          onChangeText={(text) => setUser({...user, lastName: text})}
          value={user?.lastName}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          autoCapitalize={false}
          style={{height: 40}}
          placeholder={t('newUser.form.email')}
          placeholderTextColor={Colors.darkGrey}
          onChangeText={(text) => setUser({...user, email: text})}
          value={user?.email}
        />
      </InputGroup>
      <InputGroup>
        <TextInput
          keyboardType="numeric"
          style={{height: 40}}
          placeholder={t('newUser.form.phone')}
          placeholderTextColor={Colors.darkGrey}
          onChangeText={(text) => setUser({...user, phone: text})}
          value={user?.phone}
        />
      </InputGroup>
      <CustomSelect
        placeHolder={t('newUser.form.role')}
        value={
          user?.role && roleOptions?.find((r) => r.value === user.role).label
        }
        onPress={() => setIsPickerVisibleRole(true)}
      />
      <CustomSelect
        placeHolder={t('newUser.form.gender')}
        value={
          user?.gender &&
          genderOptions?.find((r) => r.value === user.gender).label
        }
        onPress={() => setIsPickerVisibleGender(true)}
      />
      <CustomSelect
        placeHolder={t('newUser.form.language')}
        value={
          user?.language &&
          languageOptions?.find((r) => r.value === user.language).label
        }
        onPress={() => setIsPickerVisibleLanguage(true)}
      />
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
