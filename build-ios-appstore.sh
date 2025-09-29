#!/bin/bash

echo "🍎 Generando build de iOS para App Store (no TestFlight)..."

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

# Volver a iOS y generar build para App Store
echo "📱 Generando build para App Store..."
cd ios

# Usar Fastlane con configuración específica para App Store
echo "🚀 Ejecutando Fastlane para App Store..."
bundle exec fastlane release

echo "✅ Build de iOS para App Store completado!"
echo "📱 Archivo IPA generado y subido a App Store Connect"
echo ""
echo "🔍 Verifica en App Store Connect que el build aparezca correctamente"
