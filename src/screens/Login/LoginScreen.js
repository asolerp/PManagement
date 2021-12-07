import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, Image, StyleSheet} from 'react-native';

// UI
import LinearGradient from 'react-native-linear-gradient';
import LoginForm from '../../components/Forms/Auth/LoginForm';
import {KeyboardAvoidingView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const LOGIN_SCREEN_KEY = 'loginScreen';

const LoginScreen = () => {
  const {t} = useTranslation();
  return (
    <LinearGradient colors={['#126D9B', '#67B26F']} style={styles.gradient}>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior="padding"
          keyboardVerticalOffset={15}>
          <View style={styles.container}>
            <View style={styles.logoWrapper}>
              <Image
                style={styles.logo}
                source={require('../../assets/images/logo_pm_servicios.png')}
              />
            </View>
            <View style={styles.welcomeWrapper}>
              <Text style={styles.welcomeText}>{t('login.welcome')}</Text>
              <Text style={styles.welcomeTextSub}>{t('login.login')}</Text>
            </View>
            <LoginForm />
            {/* <View style={styles.inputsWrapper} /> */}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 30,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    resizeMode: 'contain',
  },
  welcomeWrapper: {
    flex: 1,
    // marginBottom: '40%',
  },
  inputsWrapper: {
    backgroundColor: 'red',
    flexGrow: 1,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },
  welcomeTextSub: {
    color: 'white',
    fontSize: 20,
  },
  bottomWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  signUpText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default LoginScreen;
