import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from '../../Elements/CustomButton';

//Firebase
import auth from '@react-native-firebase/auth';

// UI

import { TouchableWithoutFeedback } from 'react-native';
import { info } from '../../../lib/logging';
import { useTranslation } from 'react-i18next';
import { TextInputController } from '../TextInputController';
import theme from '../../../Theme/Theme';
import Icon from 'react-native-vector-icons/Ionicons';

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
      await auth().signInWithEmailAndPassword(data.username, data.password);
    } catch (err) {
      info({
        message: t('login.fail'),
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
