# 📱 Plan de Migración a Expo SDK 52

## 📊 Resumen del Estado Actual

| Aspecto | Estado Actual |
|---------|---------------|
| **React Native** | 0.73.10 |
| **Target Expo SDK** | 52 (React Native 0.76) |
| **Arquitectura** | Bare workflow |
| **OTA Updates** | CodePush |
| **CI/CD** | Fastlane + Scripts personalizados |
| **Firebase** | App, Auth, Firestore, Functions, Messaging, Crashlytics, etc. |

---

## ⚠️ Análisis de Riesgo

### 🔴 Alto Riesgo (Requieren cambios significativos)

| Dependencia | Problema | Solución |
|-------------|----------|----------|
| `react-native-code-push` | No compatible con Expo managed | Migrar a **EAS Update** |
| `react-native-bootsplash` | Reemplazar por expo-splash-screen | Usar **expo-splash-screen** |
| `react-native-config` | Variables de entorno | Usar **expo-constants** + `.env` con EAS |
| `react-native-restart` | No disponible en Expo | Usar **expo-updates** `reloadAsync()` |

### 🟡 Riesgo Medio (Requieren configuración especial)

| Dependencia | Notas |
|-------------|-------|
| `@react-native-firebase/*` | Compatible con **Expo Dev Client** (prebuild) |
| `@notifee/react-native` | Compatible con dev client |
| `react-native-maps` | Migrar a **expo-maps** o mantener con config plugin |
| `react-native-image-crop-picker` | Usar **expo-image-picker** |
| `react-native-image-resizer` | Usar **expo-image-manipulator** |
| `react-native-linear-gradient` | Usar **expo-linear-gradient** |
| `react-native-svg` | Usar **react-native-svg** con config |

### 🟢 Bajo Riesgo (Compatibles o fácil migración)

| Dependencia | Estado |
|-------------|--------|
| `react-native-gesture-handler` | ✅ Compatible |
| `react-native-reanimated` | ✅ Compatible |
| `react-native-screens` | ✅ Compatible |
| `react-native-safe-area-context` | ✅ Compatible |
| `@react-navigation/*` | ✅ Compatible |
| `react-native-vector-icons` | ✅ Compatible con config plugin |

---

## 🗓️ Plan de Migración por Fases

### 📅 Fase 1: Preparación (1-2 semanas)

#### 1.1 Crear branch de migración
```bash
git checkout -b feature/expo-migration
```

#### 1.2 Instalar Expo CLI y dependencias base
```bash
# Instalar Expo CLI globalmente
npm install -g expo-cli eas-cli

# Inicializar Expo en el proyecto existente
npx install-expo-modules@latest
```

#### 1.3 Actualizar `package.json`
```json
{
  "name": "portmanagement",
  "version": "1.9.8",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "prebuild": "expo prebuild",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "update": "eas update"
  }
}
```

#### 1.4 Crear `app.json` / `app.config.js` para Expo
```javascript
// app.config.js
export default {
  expo: {
    name: "Port Management",
    slug: "portmanagement",
    version: "1.9.8",
    orientation: "portrait",
    icon: "./src/assets/images/port.png",
    userInterfaceStyle: "automatic",
    scheme: "portmanagement",
    
    splash: {
      image: "./assets/bootsplash/logo.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF"
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.portmanagement",
      googleServicesFile: "./ios/Firebase/Prod/GoogleService-Info.plist",
      buildNumber: "27",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "...",
        NSCameraUsageDescription: "...",
        NSPhotoLibraryUsageDescription: "..."
      }
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: "./android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.portmanagement",
      googleServicesFile: "./android/app/google-services.json",
      versionCode: 27,
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      [
        "react-native-maps",
        {
          androidApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
        }
      ],
      "expo-font"
    ],
    
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    },
    
    updates: {
      url: "https://u.expo.dev/your-project-id"
    },
    
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};
```

---

### 📅 Fase 2: Migración de Dependencias (2-3 semanas)

#### 2.1 Reemplazar dependencias incompatibles

```bash
# Desinstalar dependencias que serán reemplazadas
npm uninstall \
  react-native-code-push \
  react-native-bootsplash \
  react-native-splash-screen \
  react-native-config \
  react-native-restart \
  react-native-image-crop-picker \
  react-native-image-resizer \
  react-native-linear-gradient

# Instalar equivalentes de Expo
npx expo install \
  expo-splash-screen \
  expo-constants \
  expo-updates \
  expo-image-picker \
  expo-image-manipulator \
  expo-linear-gradient \
  expo-font \
  expo-build-properties
```

#### 2.2 Tabla de Migración de Dependencias

| Antes | Después | Cambios en Código |
|-------|---------|-------------------|
| `react-native-code-push` | `expo-updates` | Ver sección 3.1 |
| `react-native-bootsplash` | `expo-splash-screen` | Ver sección 3.2 |
| `react-native-config` | `expo-constants` | `Config.VAR` → `Constants.expoConfig.extra.VAR` |
| `react-native-restart` | `expo-updates` | `RNRestart.Restart()` → `Updates.reloadAsync()` |
| `react-native-image-crop-picker` | `expo-image-picker` | API similar, ajustar opciones |
| `react-native-image-resizer` | `expo-image-manipulator` | API diferente |
| `react-native-linear-gradient` | `expo-linear-gradient` | Import cambia |
| `react-native-geolocation` | `expo-location` | API similar |

#### 2.3 Mantener dependencias con Config Plugins

Estas dependencias funcionan con Expo usando config plugins:

```bash
npx expo install \
  @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @react-native-firebase/functions \
  @react-native-firebase/messaging \
  @react-native-firebase/crashlytics \
  @react-native-firebase/storage \
  @react-native-firebase/remote-config
```

---

### 📅 Fase 3: Actualización de Código (1-2 semanas)

#### 3.1 Migrar CodePush a EAS Update

**Antes (`index.js`):**
```javascript
import CodePush from 'react-native-code-push';

let CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: true,
};

const AppWithCodePush = CodePush(CodePushOptions)(App);
AppRegistry.registerComponent(appName, () => AppWithCodePush);
```

**Después (`App.js`):**
```javascript
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Alert.alert(
          'Actualización disponible',
          '¿Deseas actualizar ahora?',
          [
            { text: 'Más tarde', style: 'cancel' },
            {
              text: 'Actualizar',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  }

  // ... resto del componente
}
```

#### 3.2 Migrar Splash Screen

**Antes:**
```javascript
import RNBootSplash from 'react-native-bootsplash';

// En App.js
useEffect(() => {
  RNBootSplash.hide({ fade: true });
}, []);
```

**Después:**
```javascript
import * as SplashScreen from 'expo-splash-screen';

// Mantener splash visible mientras carga
SplashScreen.preventAutoHideAsync();

function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Cargar recursos, verificar auth, etc.
        await loadResources();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);
}
```

#### 3.3 Migrar Image Picker

**Antes:**
```javascript
import ImagePicker from 'react-native-image-crop-picker';

const pickImage = async () => {
  const image = await ImagePicker.openPicker({
    width: 300,
    height: 400,
    cropping: true
  });
};
```

**Después:**
```javascript
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  });

  if (!result.canceled) {
    // Si necesitas redimensionar
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 300, height: 400 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
  }
};
```

#### 3.4 Migrar Linear Gradient

**Antes:**
```javascript
import LinearGradient from 'react-native-linear-gradient';
```

**Después:**
```javascript
import { LinearGradient } from 'expo-linear-gradient';
// La API es idéntica
```

#### 3.5 Actualizar Entry Point

**Antes (`index.js`):**
```javascript
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

**Después:** Eliminar `index.js` y usar el entry point de Expo automáticamente.

---

### 📅 Fase 4: Configuración de EAS (1 semana)

#### 4.1 Inicializar EAS

```bash
# Login en Expo
eas login

# Inicializar proyecto EAS
eas init

# Configurar builds
eas build:configure
```

#### 4.2 Crear `eas.json`

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

#### 4.3 Configurar Secretos

```bash
# Configurar secretos de Firebase
eas secret:create --scope project --name FIREBASE_API_KEY --value "xxx"
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "xxx"

# Configurar credenciales de iOS
eas credentials
```

---

### 📅 Fase 5: Testing y QA (2-3 semanas)

#### 5.1 Generar Dev Client

```bash
# Crear build de desarrollo para testing
eas build --profile development --platform all
```

#### 5.2 Checklist de Testing

- [ ] **Autenticación**
  - [ ] Login normal
  - [ ] Login con clave maestra
  - [ ] Logout
  - [ ] Persistencia de sesión

- [ ] **Firebase**
  - [ ] Firestore queries
  - [ ] Cloud Functions
  - [ ] Push Notifications
  - [ ] Crashlytics reporta errores
  - [ ] Storage (imágenes)

- [ ] **Navegación**
  - [ ] Todas las pantallas cargan
  - [ ] Deep links funcionan
  - [ ] Back navigation

- [ ] **Features específicas**
  - [ ] Time tracking
  - [ ] Cámara / galería
  - [ ] Mapas
  - [ ] Geolocalización

- [ ] **OTA Updates**
  - [ ] `eas update` funciona
  - [ ] La app detecta actualizaciones
  - [ ] Se aplican correctamente

---

### 📅 Fase 6: Despliegue (1 semana)

#### 6.1 Build de Producción

```bash
# Construir para producción
eas build --profile production --platform all

# Subir a stores
eas submit --platform all
```

#### 6.2 Migrar de CodePush a EAS Update

```bash
# Publicar actualización OTA
eas update --branch production --message "Migración a Expo completada"
```

---

## 📁 Estructura Final del Proyecto

```
PManagement/
├── app.config.js          # Configuración de Expo
├── eas.json               # Configuración de EAS Build
├── package.json           # Dependencias actualizadas
├── babel.config.js        # Actualizado para Expo
├── metro.config.js        # Actualizado para Expo
├── tsconfig.json          # (opcional) si migras a TypeScript
├── src/
│   ├── App.js             # Entry point actualizado
│   ├── components/
│   ├── Screens/
│   ├── hooks/
│   ├── Services/
│   └── ...
├── assets/
│   ├── splash.png
│   ├── icon.png
│   └── adaptive-icon.png
└── .env                   # Variables de entorno (no commitear)
```

---

## ⏱️ Cronograma Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| 1. Preparación | 1-2 semanas | - |
| 2. Migración de Deps | 2-3 semanas | Fase 1 |
| 3. Actualización Código | 1-2 semanas | Fase 2 |
| 4. Configuración EAS | 1 semana | Fase 3 |
| 5. Testing | 2-3 semanas | Fase 4 |
| 6. Despliegue | 1 semana | Fase 5 |
| **TOTAL** | **8-12 semanas** | |

---

## 💡 Beneficios de la Migración

### ✅ Ventajas

1. **Actualizaciones OTA más fáciles** - EAS Update es más robusto que CodePush
2. **Builds en la nube** - No necesitas máquina local para builds
3. **Actualizaciones de React Native simplificadas** - Expo maneja la complejidad
4. **Mejor DX** - Hot reload mejorado, debugging más fácil
5. **Expo SDK** - Acceso a muchas librerías bien mantenidas
6. **Push Notifications simplificadas** - expo-notifications como alternativa

### ⚠️ Consideraciones

1. **Tamaño del bundle** - Puede aumentar ligeramente
2. **Curva de aprendizaje** - EAS tiene su propia CLI y conceptos
3. **Dependencias nativas** - Algunas requieren config plugins personalizados
4. **Costos** - EAS tiene límites en el plan gratuito

---

## 🔗 Recursos

- [Expo SDK 52 Documentation](https://docs.expo.dev/)
- [Migrating from Bare to Expo](https://docs.expo.dev/bare/installing-expo-modules/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [React Native Firebase with Expo](https://rnfirebase.io/#expo)

---

## ❓ ¿Necesitas Ayuda?

Si tienes dudas durante la migración, estos son los puntos más comunes de fricción:

1. **Firebase + Expo** → Requiere `expo prebuild` y Dev Client
2. **Notificaciones Push** → Configurar certificados en EAS
3. **Mapas** → Config plugin específico de Google Maps
4. **Variables de entorno** → Usar `extra` en app.config.js

---

*Documento creado: Febrero 2026*
*Última actualización: Auto-generado*
