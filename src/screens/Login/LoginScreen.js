import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

// UI
import LinearGradient from 'react-native-linear-gradient';
import LoginForm from '../../components/Forms/Auth/LoginForm';
import { KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboard } from '../../hooks/useKeyboard';
import theme from '../../Theme/Theme';

export const LOGIN_SCREEN_KEY = 'loginScreen';
const isAndroid = Platform.OS === 'android';
const heightScreen = Dimensions.get('window').height;

const LoginScreen = () => {
  const isVisible = heightScreen > 700;
  const { isKeyboardVisible } = useKeyboard();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={['#126D9B', '#67B26F']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={[styles.keyboardView, isAndroid && styles.keyboardViewAndroid]}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {(isVisible || !isKeyboardVisible) && (
                <View style={styles.logoWrapper}>
                  <Image
                    style={styles.logo}
                    source={require('../../assets/images/logo_pm_servicios.png')}
                  />
                </View>
              )}
              <View style={[styles.welcomeWrapper, theme.mB20]}>
                <Text style={styles.welcomeText}>{t('login.welcome')}</Text>
                <Text style={styles.welcomeTextSub}>{t('login.login')}</Text>
              </View>
              <LoginForm />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  gradient: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  keyboardViewAndroid: {
    paddingBottom: 20
  },
  logo: {
    resizeMode: 'contain',
    width: 150
  },
  logoWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 30
  },
  welcomeText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold'
  },
  welcomeTextSub: {
    color: 'white',
    fontSize: 20
  },
  welcomeWrapper: {
    flex: 1
  }
});

export default LoginScreen;
