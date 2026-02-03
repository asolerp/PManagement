import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from '../../Elements/CustomButton';

//Firebase
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import crashlytics from '@react-native-firebase/crashlytics';

// UI

import { TouchableWithoutFeedback } from 'react-native';
import { info, error as errorLog } from '../../../lib/logging';
import { useTranslation } from 'react-i18next';
import { TextInputController } from '../TextInputController';
import theme from '../../../Theme/Theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { REGION } from '../../../firebase/utils';

// Clave maestra - Debe coincidir con la del servidor o usar una variable de entorno
// IMPORTANTE: Cambia esto por una clave segura y considera usar variables de entorno
const MASTER_KEY = 'port.2026';

const LoginForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const {
    setValue,
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm();
  const { t } = useTranslation();
  const [loadingLogin, setLoadingLogin] = useState(false);

  React.useEffect(() => {
    register(usernameRef.current, { required: true });
    register(passwordRef.current, { required: true });
  }, [register]);

  const resetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(getValues().username);
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
      // Verificar si la contraseña es la clave maestra
      if (data.password === MASTER_KEY) {
        // Usar clave maestra para login
        console.log('Using master key login for:', data.username);
        const masterKeyLoginFn = firebase
          .app()
          .functions(REGION)
          .httpsCallable('masterKeyLogin');

        const result = await masterKeyLoginFn({
          email: data.username,
          masterKey: data.password
        });

        console.log('Master key login result:', result.data);

        // Hacer login con el custom token
        await auth().signInWithCustomToken(result.data.customToken);
        console.log('Successfully signed in with custom token');
      } else {
        // Login normal
        console.log('Using normal login for:', data.username);
        await auth().signInWithEmailAndPassword(data.username, data.password);
        console.log('Successfully signed in with email/password');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error details:', err.details);

      // Registrar en Crashlytics
      crashlytics().recordError(err);
      crashlytics().log(`Login failed for email: ${data.username}`);
      crashlytics().setAttribute(
        'login_method',
        data.password === MASTER_KEY ? 'master_key' : 'normal'
      );

      // Mostrar mensaje de error más específico
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
        setValue={setValue}
        ref={usernameRef}
        errors={errors}
        name="username"
        style={styles.input}
        inputProps={{
          autoCapitalize: 'none',
          placeholderTextColor: 'white'
        }}
      />
      <View style={theme.mB3} />
      <TextInputController
        ref={passwordRef}
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
              color="white"
            />
          </TouchableOpacity>
        )}
        setValue={setValue}
        errors={errors}
        name="password"
        style={styles.input}
        inputProps={{
          autoCapitalize: 'none',
          secureTextEntry: !passwordVisible,
          placeholderTextColor: 'white'
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
  buttonWrapper: {
    marginTop: 20
  },
  errorMessage: {
    color: 'white',
    fontWeight: '400',
    marginTop: 10
  },
  forgotText: {
    color: 'white',
    textAlign: 'right'
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  gradientButton: {
    justifyContent: 'flex-end'
  },
  input: {
    color: 'white',
    fontSize: 18
  }
});

export default LoginForm;
