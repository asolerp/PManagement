import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import CustomButton from '../../Elements/CustomButton';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCustomToken
} from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import {
  getCrashlytics,
  recordError,
  log,
  setAttribute
} from '@react-native-firebase/crashlytics';
import { info, error as errorLog } from '../../../lib/logging';
import { useTranslation } from 'react-i18next';
import { TextInputController } from '../TextInputController';
import Icon from 'react-native-vector-icons/Ionicons';
import { REGION } from '../../../firebase/utils';

const MASTER_KEY = 'port.2026';

const LoginForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const { t } = useTranslation();
  const [loadingLogin, setLoadingLogin] = useState(false);

  const resetPassword = async () => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, getValues().username);
    } catch (err) {
      info({
        message: t('login.reset_fail'),
        asToast: true
      });
    }
  };

  const signIn = async data => {
    setLoadingLogin(true);
    try {
      const auth = getAuth();
      if (data.password === MASTER_KEY) {
        console.log('Using master key login for:', data.username);
        const app = getApp();
        const functions = getFunctions(app, REGION);
        const masterKeyLoginFn = httpsCallable(functions, 'masterKeyLogin');

        const result = await masterKeyLoginFn({
          email: data.username,
          masterKey: data.password
        });

        console.log('Master key login result:', result.data);
        await signInWithCustomToken(auth, result.data.customToken);
        console.log('Successfully signed in with custom token');
      } else {
        console.log('Using normal login for:', data.username);
        await signInWithEmailAndPassword(auth, data.username, data.password);
        console.log('Successfully signed in with email/password');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error details:', err.details);

      const crashlyticsInstance = getCrashlytics();
      recordError(crashlyticsInstance, err);
      log(crashlyticsInstance, `Login failed for email: ${data.username}`);
      setAttribute(
        crashlyticsInstance,
        'login_method',
        data.password === MASTER_KEY ? 'master_key' : 'normal'
      );

      let errorMessage = t('login.fail');

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Clave maestra inválida';
      } else if (err.code === 'invalid-argument') {
        errorMessage = err.message || 'Datos inválidos';
      } else if (err.message) {
        errorMessage = err.message;
      }

      errorLog({
        message: errorMessage,
        asToast: true
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
          required: true
        }}
        control={control}
        errors={errors}
        name="username"
        style={styles.input}
        inputProps={{
          autoCapitalize: 'none',
          placeholderTextColor: '#FFFFFF'
        }}
      />
      <View style={styles.spacer} />
      <TextInputController
        placeholder={'Contraseña'}
        rules={{
          required: true
        }}
        right={() => (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
        control={control}
        errors={errors}
        name="password"
        style={styles.input}
        inputProps={{
          autoCapitalize: 'none',
          secureTextEntry: !passwordVisible,
          placeholderTextColor: '#FFFFFF'
        }}
      />

      <TouchableWithoutFeedback onPress={() => resetPassword()}>
        <Text style={styles.forgotText}>{t('login.forgot')}</Text>
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
  buttonWrapper: {
    marginTop: 20
  },
  forgotText: {
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'right'
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  input: {
    color: '#FFFFFF',
    fontSize: 18
  },
  spacer: {
    marginBottom: 20
  }
});

export default LoginForm;
