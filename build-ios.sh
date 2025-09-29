#!/bin/bash

echo "🍎 Generando build de iOS para nueva release v1.9.5..."

# Limpiar Metro cache
echo "🧹 Limpiando Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# Limpiar build de iOS
echo "🧹 Limpiando build de iOS..."
cd ios
rm -rf build/
rm -rf DerivedData/

# Instalar pods
echo "📦 Instalando pods..."
pod install --repo-update

# Generar bundle de JavaScript
echo "📦 Generando bundle de JavaScript..."
cd ..
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios/

# Volver a iOS y generar build
echo "📱 Generando build de iOS..."
cd ios

# Usar Fastlane para generar el build
echo "🚀 Ejecutando Fastlane beta..."
bundle exec fastlane beta

echo "✅ Build de iOS completado!"
echo "📱 Archivo IPA generado en: ios/build/"
