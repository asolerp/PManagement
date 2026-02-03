#!/bin/bash

echo "🧹 Limpiando caché y dependencias..."

# Limpiar node_modules y lock files
echo "📦 Limpiando node_modules..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# Limpiar caché de React Native
echo "⚛️ Limpiando caché de React Native..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Limpiar watchman
echo "👀 Limpiando Watchman..."
watchman watch-del-all 2>/dev/null || echo "Watchman no está instalado o no hay watches"

# Limpiar Metro bundler cache
echo "🚇 Limpiando caché de Metro..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Limpiar build folders
echo "🏗️ Limpiando carpetas de build..."
rm -rf ios/build
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

# Limpiar Pods (iOS)
echo "🍎 Limpiando Pods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods
cd ..

# Limpiar funciones de Firebase
echo "🔥 Limpiando funciones de Firebase..."
cd functions
rm -rf node_modules
rm -rf package-lock.json
cd ..

# Limpiar caché de npm
echo "📦 Limpiando caché de npm..."
npm cache clean --force

# Limpiar caché de yarn (si existe)
if command -v yarn &> /dev/null; then
    echo "🧶 Limpiando caché de yarn..."
    yarn cache clean
fi

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. npm install (o yarn install)"
echo "2. cd ios && pod install && cd .."
echo "3. cd functions && npm install && cd .."
echo "4. Reiniciar Metro bundler: npm start -- --reset-cache"

