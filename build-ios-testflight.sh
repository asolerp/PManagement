#!/bin/bash

echo "🍎 Generando build de iOS para TestFlight v1.9.5..."

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

# Volver a iOS y generar build para TestFlight
echo "📱 Generando build para TestFlight..."
cd ios

# Usar Fastlane con configuración específica para TestFlight
echo "🚀 Ejecutando Fastlane para TestFlight..."
bundle exec fastlane beta

echo "✅ Build de iOS para TestFlight completado!"
echo "📱 Archivo IPA generado y subido a TestFlight"
echo ""
echo "🔍 Verifica en App Store Connect → TestFlight que el build aparezca correctamente"
