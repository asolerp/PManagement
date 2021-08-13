import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, Image, StyleSheet, StatusBar} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// UI
import LinearGradient from 'react-native-linear-gradient';
import LoginForm from '../../components/Forms/Auth/LoginForm';

export const LOGIN_SCREEN_KEY = 'loginScreen';

const LoginScreen = () => {
  const {t} = useTranslation();
  return (
    <React.Fragment>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient colors={['#126D9B', '#67B26F']} style={styles.gradient}>
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
          <KeyboardAwareScrollView>
            <View style={styles.inputsWrapper}>
              <LoginForm />
            </View>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </View>
    </React.Fragment>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    resizeMode: 'contain',
  },
  welcomeWrapper: {
    // marginBottom: '40%',
  },
  inputsWrapper: {
    paddingTop: '50%',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
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
