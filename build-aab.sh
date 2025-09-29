#!/bin/bash

echo "🚀 Generando AAB para Google Play Console con API 35..."

# Limpiar completamente
echo "🧹 Limpiando proyecto..."
cd android
./gradlew clean --no-daemon
cd ..

# Limpiar Metro cache
echo "🧹 Limpiando Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# Generar bundle de JavaScript
echo "📦 Generando bundle de JavaScript..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Crear directorio si no existe
mkdir -p android/app/src/main/assets

# Generar AAB con configuración específica
echo "📱 Generando AAB con API 35..."
cd android

# Usar Gradle con configuración específica para evitar dexing issues
./gradlew bundleRelease \
  --no-daemon \
  --stacktrace \
  -Dorg.gradle.jvmargs="-Xmx4096m -XX:MaxMetaspaceSize=512m" \
  -Pandroid.enableR8=false \
  -Pandroid.enableR8.fullMode=false

# Verificar si se generó el AAB
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "✅ ¡AAB generado exitosamente con API 35!"
    echo "📍 Ubicación: android/app/build/outputs/bundle/release/app-release.aab"
    ls -la app/build/outputs/bundle/release/app-release.aab
else
    echo "❌ Error: No se pudo generar el AAB"
    echo "🔄 Intentando generar APK como alternativa..."
    ./gradlew assembleRelease --no-daemon
    
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        echo "✅ APK generado como alternativa!"
        echo "📍 Ubicación: android/app/build/outputs/apk/release/app-release.apk"
        echo "⚠️  Nota: Google Play Console requiere AAB, pero puedes convertir este APK usando bundletool"
        ls -la app/build/outputs/apk/release/app-release.apk
    fi
fi

cd ..
echo "🏁 Build completado con API 35!"