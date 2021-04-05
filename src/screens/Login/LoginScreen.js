import React from 'react';
import {View, Text, Image, StyleSheet, StatusBar} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// UI
import LinearGradient from 'react-native-linear-gradient';
import LoginForm from '../../components/Forms/Auth/LoginForm';

const LoginScreen = () => {
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
            <Text style={styles.welcomeText}>Bienvenido!</Text>
            <Text style={styles.welcomeTextSub}>Logeate para continuar</Text>
          </View>
          <KeyboardAwareScrollView>
            <View style={styles.inputsWrapper}>
              <LoginForm />
            </View>
          </KeyboardAwareScrollView>
          <View style={styles.bottomWrapper}>
            <Text style={styles.signUpText}>
              Soy un nuevo usuario. Regístrate!
            </Text>
          </View>
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
