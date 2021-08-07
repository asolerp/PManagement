import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';

import {Text, View, StyleSheet} from 'react-native';
import CustomButton from '../../Elements/CustomButton';
import Toast from 'react-native-toast-message';

//Firebase
import auth from '@react-native-firebase/auth';

// UI

import {TextInput} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';

const LoginForm = () => {
  const {control, handleSubmit, getValues} = useForm();

  const [loadingLogin, setLoadingLogin] = useState(false);

  const resetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(getValues().username);
    } catch (err) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Atención!',
        text2: 'Comprueba que has introducido tu email y que es correcto',
      });
    }
  };

  const signIn = async (data) => {
    setLoadingLogin(true);
    try {
      await auth().signInWithEmailAndPassword(data.username, data.password);
    } catch (err) {
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: 'Atención!',
        text2: 'Asegúrate de que el email y la contraseña son correctos',
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <View style={styles.formWrapper}>
      <Controller
        control={control}
        render={({onChange, onBlur, value}) => (
          <TextInput
            value={value}
            onChangeText={(v) => onChange(v)}
            onBlur={onBlur}
            placeholder="Email"
            autoCapitalize="none"
            name="username"
            style={styles.input}
            placeholderTextColor="white"
          />
        )}
        name="username"
        rules={{required: true}}
        defaultValue=""
      />
      <Controller
        control={control}
        render={({onChange, onBlur, value}) => (
          <TextInput
            value={value}
            onChangeText={(v) => onChange(v)}
            onBlur={onBlur}
            placeholder="Password"
            name="password"
            autoCapitalize="none"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="white"
          />
        )}
        name="password"
        rules={{required: true}}
        defaultValue=""
      />
      <TouchableWithoutFeedback onPress={() => resetPassword()}>
        <Text style={styles.forgotText}>He olvidado mi contraseña</Text>
      </TouchableWithoutFeedback>
      <View style={styles.buttonWrapper}>
        <CustomButton
          onPress={handleSubmit(signIn)}
          title="Login"
          loading={loadingLogin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formWrapper: {
    flex: 1,
  },
  forgotText: {
    color: 'white',
    textAlign: 'right',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    marginBottom: 20,
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
