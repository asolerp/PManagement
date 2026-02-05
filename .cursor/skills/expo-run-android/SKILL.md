---
name: expo-run-android
description: Construye y ejecuta la app en Android emulator o device. Usar cuando el usuario quiera probar en Android, debug en emulator, o verificar cambios nativos Android.
---

# Expo Run Android

## Prerequisitos

- Android Studio instalado
- Android SDK configurado
- `ANDROID_HOME` en PATH
- Emulator o device conectado

## Comando Principal

```bash
# Run en emulator/device conectado
npx expo run:android

# Especificar device
npx expo run:android --device "Pixel_6_API_33"

# Build de release
npx expo run:android --variant release
```

## Verificar Setup

```bash
# Verificar ADB
adb devices

# Listar emulators
emulator -list-avds

# Iniciar emulator
emulator -avd Pixel_6_API_33
```

## Troubleshooting

### Gradle Build Falla

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### SDK Not Found

```bash
# Verificar ANDROID_HOME
echo $ANDROID_HOME

# Debería ser algo como:
# macOS: /Users/$USER/Library/Android/sdk
# Linux: /home/$USER/Android/Sdk
```

### Out of Memory

```bash
# En android/gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
```

## Logs

```bash
# Logs de la app
npx react-native log-android

# O directamente con logcat
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## Checklist Pre-Run

- [ ] `npx expo prebuild` si hay cambios nativos
- [ ] Emulator corriendo o device conectado
- [ ] USB debugging habilitado (si es device físico)
- [ ] Suficiente espacio en disco para build
