#!/bin/bash

echo "🤖 Generando AAB de Android para nueva release v1.9.5..."

# Limpiar Metro cache
echo "🧹 Limpiando Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# Limpiar build de Android
echo "🧹 Limpiando build de Android..."
cd android
./gradlew clean

# Generar bundle de JavaScript
echo "📦 Generando bundle de JavaScript..."
cd ..
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Crear directorio si no existe
mkdir -p android/app/src/main/assets

# Generar AAB
echo "📱 Generando AAB con API 35..."
cd android
./gradlew bundleRelease --no-daemon --stacktrace

echo "✅ AAB de Android generado!"
echo "📱 Archivo AAB en: android/app/build/outputs/bundle/release/app-release.aab"
