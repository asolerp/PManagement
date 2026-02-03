import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Componente temporal para probar Crashlytics
 * ⚠️ ELIMINAR ANTES DE PRODUCCIÓN ⚠️
 */
const CrashlyticsTestScreen = () => {
  // 1. Crash fatal (cierra la app)
  const testFatalCrash = () => {
    Alert.alert('Crash Fatal', '¿Estás seguro? Esto cerrará la app.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Crashear',
        style: 'destructive',
        onPress: () => {
          crashlytics().log('User triggered fatal crash');
          crashlytics().crash();
        }
      }
    ]);
  };

  // 2. Error no fatal (registrado pero no cierra la app)
  const testNonFatalError = () => {
    try {
      throw new Error('Test: Error no fatal desde Crashlytics Test');
    } catch (error) {
      crashlytics().recordError(error);
      crashlytics().log('Non-fatal error triggered by user');
      Alert.alert('Error Registrado', 'El error fue enviado a Crashlytics');
    }
  };

  // 3. Error con contexto adicional
  const testErrorWithContext = () => {
    crashlytics().log('User is testing error with context');
    crashlytics().setAttribute('test_type', 'error_with_context');
    crashlytics().setAttribute('user_action', 'button_press');

    try {
      // Simular un error con más contexto
      const fakeData = null;
      // Esto causará un error porque fakeData es null
      console.log(fakeData.property);
    } catch (error) {
      crashlytics().recordError(error);
      Alert.alert(
        'Error con Contexto',
        'Error registrado con información adicional'
      );
    }
  };

  // 4. Error asíncrono
  const testAsyncError = async () => {
    crashlytics().log('Testing async error');

    try {
      // Simular una llamada asíncrona que falla
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Test: Async operation failed'));
        }, 1000);
      });
    } catch (error) {
      crashlytics().recordError(error);
      crashlytics().log('Async error caught and recorded');
      Alert.alert(
        'Error Asíncrono',
        'Error asíncrono registrado en Crashlytics'
      );
    }
  };

  // 5. Error de autenticación simulado
  const testAuthError = () => {
    const error = new Error('Test: Simulated authentication error');
    error.code = 'auth/user-not-found';

    crashlytics().recordError(error);
    crashlytics().log('Simulated auth error');
    crashlytics().setAttribute('error_type', 'authentication');

    Alert.alert('Error de Auth Simulado', 'Error de autenticación registrado');
  };

  // 6. Error de red simulado
  const testNetworkError = () => {
    const error = new Error('Test: Network request failed');
    error.code = 'NETWORK_ERROR';

    crashlytics().recordError(error);
    crashlytics().log('Simulated network error');
    crashlytics().setAttribute('error_type', 'network');
    crashlytics().setAttribute('endpoint', '/api/test');

    Alert.alert('Error de Red Simulado', 'Error de red registrado');
  };

  // 7. Crear múltiples logs antes de un error
  const testWithMultipleLogs = () => {
    crashlytics().log('Step 1: User opened test screen');
    crashlytics().log('Step 2: User clicked test button');
    crashlytics().log('Step 3: Processing data...');
    crashlytics().log('Step 4: About to cause error');

    try {
      throw new Error('Test: Error after multiple logs');
    } catch (error) {
      crashlytics().recordError(error);
      Alert.alert('Error con Logs', 'Error registrado con historial de logs');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Crashlytics Test</Text>
      <Text style={styles.warning}>
        ⚠️ Solo para testing - Eliminar en producción
      </Text>

      <TouchableOpacity style={styles.buttonFatal} onPress={testFatalCrash}>
        <Text style={styles.buttonText}>💥 Crash Fatal</Text>
        <Text style={styles.buttonSubtext}>Cierra la app</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testNonFatalError}>
        <Text style={styles.buttonText}>⚠️ Error No Fatal</Text>
        <Text style={styles.buttonSubtext}>No cierra la app</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testErrorWithContext}>
        <Text style={styles.buttonText}>📋 Error con Contexto</Text>
        <Text style={styles.buttonSubtext}>Incluye atributos adicionales</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testAsyncError}>
        <Text style={styles.buttonText}>⏱️ Error Asíncrono</Text>
        <Text style={styles.buttonSubtext}>Error en operación async</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testAuthError}>
        <Text style={styles.buttonText}>🔐 Error de Auth</Text>
        <Text style={styles.buttonSubtext}>Simula error de autenticación</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testNetworkError}>
        <Text style={styles.buttonText}>🌐 Error de Red</Text>
        <Text style={styles.buttonSubtext}>Simula error de conexión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testWithMultipleLogs}>
        <Text style={styles.buttonText}>📝 Error con Logs</Text>
        <Text style={styles.buttonSubtext}>Incluye historial de logs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  buttonFatal: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  buttonSubtext: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.8,
    textAlign: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  warning: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center'
  }
});

export default CrashlyticsTestScreen;
