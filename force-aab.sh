#!/bin/bash

echo "🚀 GENERACIÓN FORZADA DE AAB - SOLUCIÓN DEFINITIVA"
echo "=================================================="

# Eliminar TODAS las cachés de Gradle
echo "🧹 Eliminando TODAS las cachés de Gradle..."
rm -rf ~/.gradle/caches/
rm -rf ~/.gradle/wrapper/
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build

# Eliminar cachés de transformaciones específicas que están causando problemas
echo "🧹 Eliminando cachés de transformaciones específicas..."
rm -rf ~/.gradle/caches/transforms-3/
rm -rf ~/.gradle/caches/modules-2/

# Eliminar archivos de lock de Gradle
echo "🧹 Eliminando archivos de lock..."
find . -name "*.lock" -delete
find . -name "gradle-wrapper.jar" -delete

# Limpiar Metro cache
echo "🧹 Limpiando Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true

cd android

# Usar Gradle Wrapper para descargar la versión correcta
echo "📥 Descargando Gradle Wrapper..."
./gradlew wrapper --gradle-version 8.0.1

# Limpiar proyecto
echo "🧹 Limpiando proyecto Android..."
./gradlew clean --no-daemon

# Generar AAB con configuración específica para evitar problemas de dexing
echo "📱 Generando AAB con configuración anti-dexing..."
./gradlew bundleRelease \
  --no-daemon \
  --stacktrace \
  --no-build-cache \
  --refresh-dependencies \
  -Dorg.gradle.jvmargs="-Xmx6144m -XX:MaxMetaspaceSize=1024m" \
  -Dfile.encoding=UTF-8 \
  -Dkotlin.daemon.jvm.options="-Xmx2048m"

if [ $? -eq 0 ]; then
    echo "✅ ¡AAB GENERADO EXITOSAMENTE!"
    echo "📍 Ubicación: android/app/build/outputs/bundle/release/app-release.aab"
    ls -la android/app/build/outputs/bundle/release/
else
    echo "❌ Error al generar AAB"
    exit 1
fi

