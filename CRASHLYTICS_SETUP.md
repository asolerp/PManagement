# Guía de Implementación: Firebase Crashlytics

## ¿Qué es Crashlytics?

Firebase Crashlytics es un **reporte de crashes en tiempo real** que te ayuda a:
- 📊 Ver crashes y errores en producción
- 🔍 Identificar qué usuarios se ven afectados
- 📈 Priorizar bugs por impacto
- 🐛 Debug con stack traces detallados
- 📱 Ver información del dispositivo y sistema operativo

## Instalación

### 1. Instalar el paquete

```bash
npm install @react-native-firebase/crashlytics@18.6.1
```

### 2. Configurar iOS

**a) Instalar Pods:**
```bash
cd ios
pod install
cd ..
```

**b) Habilitar en Firebase Console:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en "Crashlytics" en el menú lateral
4. Click en "Habilitar Crashlytics"

**c) Agregar script de build (opcional pero recomendado):**

Edita `ios/portmanagement.xcodeproj/project.pbxproj` o desde Xcode:
1. Abre el proyecto en Xcode
2. Click en el target de tu app
3. Build Phases → + → New Run Script Phase
4. Agrega:
```bash
"${PODS_ROOT}/FirebaseCrashlytics/run"
```
5. Input Files: `${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${TARGET_NAME}`
6. Output Files: `${DERIVED_FILE_DIR}/${ARCH}/${TARGET_NAME}.framework.dSYM/Contents/Resources/DWARF/${TARGET_NAME}`

### 3. Configurar Android

**a) Edita `android/build.gradle`:**

```gradle
buildscript {
    dependencies {
        // ... otras dependencias
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
    }
}
```

**b) Edita `android/app/build.gradle`:**

```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: 'com.google.firebase.crashlytics' // Agregar esta línea

// ... resto del archivo
```

**c) Rebuild:**
```bash
cd android
./gradlew clean
cd ..
```

## Uso Básico

### 1. Importar en tus archivos

```javascript
import crashlytics from '@react-native-firebase/crashlytics';
```

### 2. Registrar crashes automáticamente

En `src/App.js`, envuelve tu app con error boundary:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

const errorHandler = (error, stackTrace) => {
  console.log('Error caught by boundary:', error);
  crashlytics().recordError(error);
};

// En tu componente App
<ErrorBoundary 
  FallbackComponent={CustomFallback}
  onError={errorHandler}
>
  {/* Tu app */}
</ErrorBoundary>
```

### 3. Registrar errores manualmente

```javascript
try {
  // Código que puede fallar
} catch (error) {
  crashlytics().recordError(error);
}
```

### 4. Registrar eventos/logs

```javascript
// Agregar logs personalizados
crashlytics().log('User clicked on buy button');

// Agregar información del usuario (útil para debug)
crashlytics().setUserId(userId);
crashlytics().setAttribute('role', userRole);
crashlytics().setAttribute('email', userEmail);
```

### 5. Forzar un crash para probar (solo en desarrollo)

```javascript
// NO DEJAR ESTO EN PRODUCCIÓN
crashlytics().crash();
```

## Integración con el Código Actual

### 1. Actualizar `useAuth.js`

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

const onAuthStateChange = callback => {
  return auth().onAuthStateChanged(user => {
    if (user) {
      // Agregar información del usuario a Crashlytics
      crashlytics().setUserId(user.uid);
      crashlytics().setAttribute('email', user.email);
      
      // ... resto del código existente
      
      .catch(error => {
        console.error('Error fetching user document:', error);
        // Registrar el error en Crashlytics
        crashlytics().recordError(error);
        crashlytics().log('Error fetching user document on auth state change');
        
        auth().signOut();
        callback({ loggedIn: false });
      });
    }
  });
};
```

### 2. Actualizar `LoginForm.js`

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

const signIn = async data => {
  setLoadingLogin(true);
  try {
    // ... código de login existente
  } catch (err) {
    console.error('Login error:', err);
    
    // Registrar en Crashlytics
    crashlytics().recordError(err);
    crashlytics().log(`Login failed for email: ${data.username}`);
    crashlytics().setAttribute('login_method', 
      data.password === MASTER_KEY ? 'master_key' : 'normal'
    );
    
    // ... manejo de errores existente
  }
};
```

### 3. Actualizar `App.js`

```javascript
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

const App = () => {
  useEffect(() => {
    // Habilitar/deshabilitar reporte automático
    crashlytics().setCrashlyticsCollectionEnabled(true);
    
    // Agregar información del dispositivo
    crashlytics().setAttribute('platform', Platform.OS);
    crashlytics().setAttribute('version', Platform.Version);
    
    // ... resto del código existente
  }, []);
  
  // Error handler personalizado
  const errorHandler = (error, stackTrace) => {
    console.log('Error caught by boundary:', error);
    crashlytics().recordError(error);
    crashlytics().log(`Error boundary caught: ${error.message}`);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ErrorBoundary 
          FallbackComponent={CustomFallback}
          onError={errorHandler}
        >
          {/* ... resto de la app */}
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};
```

## Testing

### 1. Probar en Desarrollo

```javascript
// En cualquier pantalla de la app (temporalmente)
import crashlytics from '@react-native-firebase/crashlytics';

// Botón de prueba
<Button 
  title="Test Crash" 
  onPress={() => {
    crashlytics().log('Test crash button pressed');
    crashlytics().crash();
  }}
/>
```

### 2. Probar errores no fatales

```javascript
try {
  throw new Error('Test non-fatal error');
} catch (e) {
  crashlytics().recordError(e);
}
```

### 3. Ver en Firebase Console

1. Haz un crash de prueba
2. Espera 1-2 minutos
3. Ve a Firebase Console → Crashlytics
4. Deberías ver el crash reportado

**Nota**: Los crashes pueden tardar unos minutos en aparecer en la consola.

## Best Practices

### 1. No registrar información sensible

```javascript
// ❌ MAL
crashlytics().log(`User password: ${password}`);

// ✅ BIEN
crashlytics().log('Login attempt failed');
```

### 2. Agregar contexto útil

```javascript
crashlytics().log('User navigated to checkout');
crashlytics().setAttribute('cart_items', '3');
crashlytics().setAttribute('total_amount', '99.99');
```

### 3. Usar en todos los catches importantes

```javascript
try {
  await importantOperation();
} catch (error) {
  crashlytics().recordError(error);
  crashlytics().log('Important operation failed');
  // Manejar el error
}
```

### 4. Limpiar atributos cuando sea necesario

```javascript
// Al hacer logout
crashlytics().setUserId('');
crashlytics().setAttribute('email', '');
```

## Troubleshooting

### iOS: Crashes no aparecen

1. Asegúrate de tener el script de build configurado
2. Verifica que el DSYM esté siendo subido
3. Espera 1-2 minutos después del crash

### Android: Crashes no aparecen

1. Verifica que el plugin esté aplicado en `build.gradle`
2. Haz un clean build: `cd android && ./gradlew clean`
3. Rebuild la app

### Crashes solo en producción

Para ver crashes de producción:
1. Debe ser una build de release (no debug)
2. Debe estar instalada desde store o TestFlight
3. Puede tardar hasta 5 minutos en aparecer

## Monitoreo

### Ver estadísticas

En Firebase Console → Crashlytics verás:
- 📊 Número de crashes
- 👥 Usuarios afectados
- 📱 Dispositivos y versiones de OS
- 🔥 Crash-free rate (porcentaje de sesiones sin crashes)
- 📈 Tendencias

### Configurar alertas

1. Firebase Console → Crashlytics
2. Click en el ícono de campana (⚙️)
3. Configura alertas por email para:
   - Nuevos crashes
   - Aumento repentino en crashes
   - Regresiones

## Resumen de Comandos

```bash
# Instalar
npm install @react-native-firebase/crashlytics@18.6.1

# iOS
cd ios && pod install && cd ..

# Android
cd android && ./gradlew clean && cd ..

# Rebuild
npm run android  # o npm run ios
```

## Archivos a Modificar

1. ✅ `package.json` - agregar dependencia
2. ✅ `ios/Podfile` - automático con pod install
3. ✅ `android/build.gradle` - agregar classpath
4. ✅ `android/app/build.gradle` - aplicar plugin
5. ✅ `src/App.js` - configurar crashlytics
6. ✅ `src/Router/hooks/useAuth.js` - registrar errores de auth
7. ✅ `src/components/Forms/Auth/LoginForm.js` - registrar errores de login

## Resultado Final

Con Crashlytics implementado:
- ✅ Verás todos los crashes en tiempo real
- ✅ Sabrás exactamente qué usuario tiene problemas
- ✅ Tendrás stack traces completos para debugging
- ✅ Podrás priorizar fixes por impacto
- ✅ Recibirás alertas automáticas de nuevos crashes

