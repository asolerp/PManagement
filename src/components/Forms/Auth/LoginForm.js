import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable
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
import { Logger, error as errorLog, info } from '../../../lib/logging';
import { useTranslation } from 'react-i18next';
import { TextInputController } from '../TextInputController';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { REGION } from '../../../firebase/utils';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../Theme/Variables';

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
    const loginMethod = data.password === MASTER_KEY ? 'master_key' : 'normal';

    try {
      const auth = getAuth();
      Logger.breadcrumb('Login attempt', { method: loginMethod });

      if (data.password === MASTER_KEY) {
        const app = getApp();
        const functions = getFunctions(app, REGION);
        const masterKeyLoginFn = httpsCallable(functions, 'masterKeyLogin');

        const result = await masterKeyLoginFn({
          email: data.username,
          masterKey: data.password
        });

        await signInWithCustomToken(auth, result.data.customToken);
        Logger.info('Login successful', { method: 'master_key' });
      } else {
        await signInWithEmailAndPassword(auth, data.username, data.password);
        Logger.info('Login successful', { method: 'normal' });
      }
    } catch (err) {
      Logger.error('Login failed', err, {
        login_method: loginMethod,
        error_code: err.code
      });

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
        placeholder={t('login.email_placeholder')}
        variant="glass"
        rules={{
          required: true,
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email inválido'
          }
        }}
        left={() => (
          <MaterialIcon name="email" size={22} color="rgba(255,255,255,0.7)" />
        )}
        control={control}
        errors={errors}
        name="username"
        inputProps={{
          autoCapitalize: 'none',
          keyboardType: 'email-address',
          autoComplete: 'email'
        }}
      />

      <View style={styles.spacer} />

      <TextInputController
        placeholder={t('login.password_placeholder')}
        variant="glass"
        rules={{
          required: true
        }}
        left={() => (
          <MaterialIcon name="lock" size={22} color="rgba(255,255,255,0.7)" />
        )}
        right={() => (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={22}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        )}
        control={control}
        errors={errors}
        name="password"
        inputProps={{
          autoCapitalize: 'none',
          secureTextEntry: !passwordVisible,
          autoComplete: 'password'
        }}
      />

      <Pressable onPress={resetPassword} style={styles.forgotButton}>
        <Text style={styles.forgotText}>{t('login.forgot')}</Text>
      </Pressable>

      <View style={styles.buttonWrapper}>
        <Pressable
          onPress={handleSubmit(signIn)}
          disabled={loadingLogin}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.loginButtonPressed,
            loadingLogin && styles.loginButtonDisabled
          ]}
        >
          <Text style={styles.loginButtonText}>
            {loadingLogin ? t('login.loading') : t('login.cta')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    marginTop: Spacing.xl
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  forgotText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  loginButtonDisabled: {
    opacity: 0.7
  },
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold
  },
  spacer: {
    height: Spacing.md
  }
});

export default LoginForm;
