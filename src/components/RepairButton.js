import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  runRepair,
  repairProblematicChecklist
} from '../utils/runRepairScript';

/**
 * Botón temporal para reparar contadores negativos
 *
 * INSTRUCCIONES:
 * 1. Importar este componente en ProfileScreen o cualquier pantalla de admin
 * 2. Agregar <RepairButton /> en el render
 * 3. Presionar el botón para ejecutar la reparación
 * 4. Ver resultados en consola y en el botón
 * 5. REMOVER este componente después de reparar
 */

const RepairButton = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRepairAll = async () => {
    setIsRepairing(true);
    setError(null);
    setResult(null);

    try {
      const repairResult = await runRepair();
      setResult(repairResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRepairSingle = async () => {
    setIsRepairing(true);
    setError(null);
    setResult(null);

    try {
      await repairProblematicChecklist();
      setResult({ repairedCount: 1, total: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Reparación de Contadores</Text>
      <Text style={styles.subtitle}>
        Reparar contadores "done" negativos o incorrectos
      </Text>

      {/* Botón para reparar todos */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.buttonPrimary,
          pressed && styles.buttonPressed,
          isRepairing && styles.buttonDisabled
        ]}
        onPress={handleRepairAll}
        disabled={isRepairing}
      >
        {isRepairing ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.buttonText}>Reparando...</Text>
          </>
        ) : (
          <>
            <Icon name="build" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Reparar Todos</Text>
          </>
        )}
      </Pressable>

      {/* Botón para reparar el problemático específico */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.buttonSecondary,
          pressed && styles.buttonPressed,
          isRepairing && styles.buttonDisabled
        ]}
        onPress={handleRepairSingle}
        disabled={isRepairing}
      >
        {isRepairing ? (
          <>
            <ActivityIndicator size="small" color="#55A5AD" />
            <Text style={styles.buttonTextSecondary}>Reparando...</Text>
          </>
        ) : (
          <>
            <Icon name="build-circle" size={20} color="#55A5AD" />
            <Text style={styles.buttonTextSecondary}>
              Reparar Albercuix (-20)
            </Text>
          </>
        )}
      </Pressable>

      {/* Resultado */}
      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Icon name="check-circle" size={24} color="#10B981" />
            <Text style={styles.resultTitle}>¡Reparación Exitosa!</Text>
          </View>
          <Text style={styles.resultText}>
            ✅ Reparados: {result.repairedCount} de {result.total}
          </Text>
          {result.repairedCount === 0 && (
            <Text style={styles.resultText}>
              Todos los contadores están correctos
            </Text>
          )}
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <Icon name="error" size={24} color="#EF4444" />
            <Text style={styles.errorTitle}>Error</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.warning}>
        ⚠️ Remover este componente después de reparar
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonPressed: {
    opacity: 0.7
  },
  buttonPrimary: {
    backgroundColor: '#55A5AD'
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#55A5AD',
    borderWidth: 2
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  buttonTextSecondary: {
    color: '#55A5AD',
    fontSize: 16,
    fontWeight: '700'
  },
  container: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  errorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 16,
    fontWeight: '700'
  },
  resultContainer: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  resultText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4
  },
  resultTitle: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '700'
  },
  subtitle: {
    color: '#92400E',
    fontSize: 13,
    marginBottom: 16
  },
  title: {
    color: '#92400E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  warning: {
    color: '#92400E',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center'
  }
});

export default RepairButton;
