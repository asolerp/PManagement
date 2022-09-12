import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';

import {Text, View, StyleSheet} from 'react-native';
import CustomButton from '../../Elements/CustomButton';

//Firebase
import auth from '@react-native-firebase/auth';

// UI

import {TextInput} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';
import {info} from '../../../lib/logging';
import {useTranslation} from 'react-i18next';
import {TextInputController} from '../TextInputController';
import theme from '../../../Theme/Theme';

const LoginForm = () => {
  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm();
  const {t} = useTranslation();
  const [loadingLogin, setLoadingLogin] = useState(false);

  const resetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(getValues().username);
    } catch (err) {
      info({
        message: t('login.reset_fail'),
        asToast: true,
      });
    }
  };

  const signIn = async (data) => {
    setLoadingLogin(true);
    try {
      await auth().signInWithEmailAndPassword(data.username, data.password);
    } catch (err) {
      info({
        message: t('login.fail'),
        asToast: true,
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <View style={styles.formWrapper}>
      <TextInputController
        placeholder={'Email'}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="username"
        style={[styles.input]}
        inputProps={{
          autoCapitalize: 'none',
          placeholderTextColor: 'white',
        }}
      />
      <TextInputController
        placeholder={'Contraseña'}
        rules={{
          required: true,
        }}
        control={control}
        errors={errors}
        name="password"
        style={styles.input}
        inputProps={{
          autoCapitalize: 'none',
          secureTextEntry: true,
          placeholderTextColor: 'white',
        }}
      />
      <TouchableWithoutFeedback onPress={() => resetPassword()}>
        <Text style={[styles.forgotText, theme.mT2]}>{t('login.forgot')}</Text>
      </TouchableWithoutFeedback>
      <View style={styles.buttonWrapper}>
        <CustomButton
          onPress={handleSubmit(signIn)}
          title={t('login.cta')}
          loading={loadingLogin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  forgotText: {
    color: 'white',
    textAlign: 'right',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 18,
    padding: 10,
    borderColor: '#EAEAEA',
    marginTop: 10,
    color: 'white',
  },
  gradientButton: {
    justifyContent: 'flex-end',
  },
  buttonWrapper: {
    marginTop: 20,
  },
  errorMessage: {
    marginTop: 10,
    color: 'white',
    fontWeight: '400',
  },
});

export default LoginForm;
