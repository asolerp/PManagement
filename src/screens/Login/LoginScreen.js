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
  Keyboard,
  ScrollView
} from 'react-native';

// UI
import LinearGradient from 'react-native-linear-gradient';
import LoginForm from '../../components/Forms/Auth/LoginForm';
import { KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboard } from '../../hooks/useKeyboard';
import { Colors, FontSize, FontWeight, Spacing } from '../../Theme/Variables';

export const LOGIN_SCREEN_KEY = 'loginScreen';
const { height: heightScreen } = Dimensions.get('window');

const LoginScreen = () => {
  const isLargeScreen = heightScreen > 700;
  const { isKeyboardVisible } = useKeyboard();
  const { t } = useTranslation();

  // Ocultar logo y welcome en pantallas pequeñas cuando el teclado está visible
  const showLogo = isLargeScreen || !isKeyboardVisible;
  const showWelcome = isLargeScreen || !isKeyboardVisible;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Logo Section */}
              {showLogo && (
                <View style={styles.logoSection}>
                  <View style={styles.logoContainer}>
                    <Image
                      style={styles.logo}
                      source={require('../../assets/images/logo_pm_servicios.png')}
                    />
                  </View>
                </View>
              )}

              {/* Welcome Section */}
              {showWelcome && (
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeText}>{t('login.welcome')}</Text>
                  <Text style={styles.welcomeSubtext}>{t('login.login')}</Text>
                </View>
              )}

              {/* Form Section */}
              <View style={styles.formSection}>
                <LoginForm />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  formSection: {
    paddingBottom: Spacing.xl
  },
  gradient: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  logo: {
    height: 120,
    resizeMode: 'contain',
    width: 120
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    padding: Spacing.lg
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl']
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md
  },
  welcomeSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.normal,
    marginTop: Spacing.xs
  },
  welcomeText: {
    color: 'white',
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold
  }
});

export default LoginScreen;
