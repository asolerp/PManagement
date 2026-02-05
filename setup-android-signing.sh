#!/bin/bash

# Script para configurar Android Release Signing
# Uso: ./setup-android-signing.sh

set -e

echo "🔐 Configuración de Android Release Signing"
echo "==========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

KEYSTORE_PATH="android/app/portmanagement.keystore"

# Verificar si ya existe un keystore
if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un keystore en: $KEYSTORE_PATH${NC}"
    echo ""
    read -p "¿Quieres usar el existente? (s/n): " use_existing
    
    if [ "$use_existing" != "s" ]; then
        echo ""
        echo -e "${RED}❌ Abortado. Por favor, mueve o elimina el keystore existente.${NC}"
        exit 1
    fi
    
    KEYSTORE_EXISTS=true
else
    KEYSTORE_EXISTS=false
fi

# Si no existe, preguntar si quiere generarlo
if [ "$KEYSTORE_EXISTS" = false ]; then
    echo "No se encontró un keystore de producción."
    echo ""
    read -p "¿Quieres generar uno nuevo? (s/n): " generate_new
    
    if [ "$generate_new" = "s" ]; then
        echo ""
        echo "📝 Información para el keystore:"
        echo ""
        
        # Generar keystore
        keytool -genkeypair -v -storetype PKCS12 \
          -keystore "$KEYSTORE_PATH" \
          -alias portmanagement \
          -keyalg RSA \
          -keysize 2048 \
          -validity 10000
        
        echo ""
        echo -e "${GREEN}✅ Keystore generado correctamente${NC}"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  Necesitas un keystore para continuar.${NC}"
        echo "Opciones:"
        echo "1. Copia tu keystore existente a: $KEYSTORE_PATH"
        echo "2. Ejecuta este script de nuevo y genera uno nuevo"
        exit 0
    fi
fi

# Configurar .env
echo ""
echo "📝 Configurando archivo .env..."
echo ""

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un archivo .env${NC}"
    read -p "¿Quieres sobrescribirlo? (s/n): " overwrite
    
    if [ "$overwrite" != "s" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Archivo .env no modificado. Configúralo manualmente.${NC}"
        exit 0
    fi
fi

# Pedir las contraseñas
read -sp "Password del keystore: " KEYSTORE_PASSWORD
echo ""
read -sp "Password de la key (Enter para usar el mismo): " KEY_PASSWORD
echo ""

if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD=$KEYSTORE_PASSWORD
fi

# Crear archivo .env
cat > .env << EOF
# ========================================
# Android Signing Configuration
# ========================================
# IMPORTANTE: Este archivo contiene información sensible
# NO lo subas a Git (ya está en .gitignore)

ANDROID_KEYSTORE_PATH=portmanagement.keystore
ANDROID_KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS=portmanagement
ANDROID_KEY_PASSWORD=$KEY_PASSWORD
EOF

echo ""
echo -e "${GREEN}✅ Archivo .env configurado${NC}"
echo ""

# Resumen
echo "📋 Resumen de configuración:"
echo "============================"
echo "Keystore: $KEYSTORE_PATH"
echo "Alias: portmanagement"
echo "Password guardado en: .env"
echo ""

echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Guarda las contraseñas en un lugar seguro (1Password, etc)"
echo "2. Ejecuta: npx expo prebuild --clean"
echo "3. Ejecuta: cd android && ./gradlew bundleRelease"
echo ""
