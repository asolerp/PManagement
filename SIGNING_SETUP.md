# 🔐 Configuración de Signing para Android e iOS

Este documento explica cómo configurar el firmado de aplicaciones para Android e iOS en el proyecto migrado a Expo.

---

## 📱 Android Signing

### 1. Config Plugins creados

Se han creado 2 plugins para manejar el signing automáticamente:

- **`plugins/withAndroidSigning.js`** - Lee credenciales desde variables de entorno
- **`plugins/withAndroidSigningConfig.js`** - Configura `build.gradle` automáticamente

### 2. Variables de entorno necesarias

Crea un archivo `.env` en la raíz del proyecto (usa `env.example` como referencia):

```bash
# Android Signing
ANDROID_KEYSTORE_PATH=portmanagement.keystore
ANDROID_KEYSTORE_PASSWORD=tu_password_del_keystore
ANDROID_KEY_ALIAS=portmanagement
ANDROID_KEY_PASSWORD=tu_password_de_la_key
```

### 3. Ubicación del keystore

El keystore debe estar en: `android/app/portmanagement.keystore`

Si ya tienes un keystore existente, cópialo:

```bash
cp /ruta/a/tu/keystore.jks android/app/portmanagement.keystore
```

### 4. Generar un nuevo keystore (si no tienes uno)

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore android/app/portmanagement.keystore \
  -alias portmanagement \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Guarda las contraseñas en un lugar seguro (ej: 1Password, LastPass).

### 5. Configurar en app.config.js

Los plugins ya están agregados, solo asegúrate de que estén en el orden correcto:

```javascript
plugins: [
  // ... otros plugins
  './plugins/withAndroidSigning.js',
  './plugins/withAndroidSigningConfig.js',
]
```

### 6. Build local de release

```bash
# Con variables de entorno
ANDROID_KEYSTORE_PASSWORD=xxx ANDROID_KEY_PASSWORD=xxx npx expo run:android --variant release

# O exporta las variables primero
export ANDROID_KEYSTORE_PASSWORD="tu_password"
export ANDROID_KEY_PASSWORD="tu_password"
npx expo run:android --variant release
```

---

## 🍎 iOS Signing

### 1. Signing local (Development)

Xcode maneja esto automáticamente:

```bash
# Abre el proyecto en Xcode
open ios/PortManagement.xcworkspace

# En Xcode:
# 1. Selecciona el target "PortManagement"
# 2. Ve a "Signing & Capabilities"
# 3. Marca "Automatically manage signing"
# 4. Selecciona tu Team
```

### 2. Signing para producción (con EAS)

EAS maneja los certificados automáticamente:

```bash
# Configurar credenciales
eas credentials

# Selecciona:
# - iOS
# - Distribution Certificate
# - Provisioning Profile
```

EAS puede:
- ✅ Generar nuevos certificados automáticamente
- ✅ Usar certificados existentes
- ✅ Sincronizar con Apple Developer

---

## 🚀 EAS Build (Recomendado para Producción)

### 1. Configurar secretos en EAS

```bash
# Configurar secretos para Android
eas secret:create --scope project --name ANDROID_KEYSTORE_PASSWORD --value "tu_password"
eas secret:create --scope project --name ANDROID_KEY_PASSWORD --value "tu_password"

# Subir el keystore a EAS
eas credentials
# Selecciona: Android > Set up build credentials > Upload keystore
```

### 2. Archivo eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "buildConfiguration": "Release",
        "enterpriseProvisioning": "universal"
      }
    }
  }
}
```

### 3. Build en la nube

```bash
# Build de producción para ambas plataformas
eas build --profile production --platform all

# Solo Android
eas build --profile production --platform android

# Solo iOS
eas build --profile production --platform ios
```

---

## 📦 Flujo completo de Release

### Opción A: Build Local

```bash
# 1. Actualizar versión en app.config.js
# version: '1.9.8'
# ios.buildNumber: '28'
# android.versionCode: 28

# 2. Prebuild con las credenciales configuradas
export ANDROID_KEYSTORE_PASSWORD="xxx"
export ANDROID_KEY_PASSWORD="xxx"
npx expo prebuild --clean

# 3. Build Android
cd android && ./gradlew bundleRelease

# 4. Build iOS (en Xcode)
open ios/PortManagement.xcworkspace
# Product > Archive > Distribute App
```

### Opción B: EAS Build (Recomendado)

```bash
# 1. Actualizar versión en app.config.js

# 2. Build en la nube
eas build --profile production --platform all

# 3. Submit a las stores
eas submit --platform all
```

---

## 🔒 Seguridad

### ✅ Buenas prácticas:

1. **NUNCA** commitees el keystore al repositorio
2. **NUNCA** commitees archivos `.env` con credenciales reales
3. **SÍ** commitea `env.example` como plantilla
4. **SÍ** usa EAS Secrets para CI/CD
5. **SÍ** guarda backups del keystore en lugar seguro

### .gitignore

Asegúrate de que `.gitignore` incluya:

```gitignore
# Signing
*.keystore
*.jks
*.p12
*.mobileprovision
.env
.env.local

# Gradle signing
android/app/my-upload-key.keystore
android/key.properties
android/gradle.properties.local
```

---

## 📝 Checklist de Release

### Android

- [ ] Keystore generado y guardado en lugar seguro
- [ ] Variables de entorno configuradas
- [ ] Versión actualizada en `app.config.js`
- [ ] Build exitoso: `eas build --profile production --platform android`
- [ ] AAB generado correctamente
- [ ] Upload a Google Play Console

### iOS

- [ ] Certificados configurados en EAS
- [ ] Provisioning profiles actualizados
- [ ] Versión actualizada en `app.config.js`
- [ ] Build exitoso: `eas build --profile production --platform ios`
- [ ] IPA generado correctamente
- [ ] Upload a App Store Connect

---

## 🆘 Troubleshooting

### Error: "keystore not found"

```bash
# Verifica que el keystore existe
ls -la android/app/*.keystore

# Verifica el path en las variables de entorno
echo $ANDROID_KEYSTORE_PATH
```

### Error: "incorrect password"

```bash
# Verifica las contraseñas
echo $ANDROID_KEYSTORE_PASSWORD
echo $ANDROID_KEY_PASSWORD

# Prueba el keystore manualmente
keytool -list -v -keystore android/app/portmanagement.keystore
```

### Error: "signing config not found"

```bash
# Regenera el proyecto nativo
npx expo prebuild --clean

# Los plugins se aplicarán automáticamente
```

---

## 📚 Referencias

- [Expo App Signing](https://docs.expo.dev/app-signing/app-credentials/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Android Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)

---

*Última actualización: Febrero 2026*
