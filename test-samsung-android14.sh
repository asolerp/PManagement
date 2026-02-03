#!/bin/bash

# Script de diagnóstico para Samsung Android 14
# Uso: ./test-samsung-android14.sh [debug|release|release-no-minify|logcat|clean]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

MODE=${1:-help}

case $MODE in
    debug)
        print_header "Generando APK Debug"
        cd android
        ./gradlew clean
        ./gradlew assembleDebug
        print_success "APK Debug generado"
        echo -e "${GREEN}Ubicación: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
        
        print_warning "Instalar en dispositivo:"
        echo "  adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
        cd ..
        ;;
    
    release)
        print_header "Generando APK Release (CON minify)"
        
        # Verificar que minifyEnabled esté en true
        if grep -q "minifyEnabled false" android/app/build.gradle; then
            print_warning "minifyEnabled está en false. Cambiando a true..."
            sed -i.bak 's/minifyEnabled false/minifyEnabled true/g' android/app/build.gradle
        fi
        
        cd android
        ./gradlew clean
        ./gradlew assembleRelease
        print_success "APK Release generado (CON minify)"
        echo -e "${GREEN}Ubicación: android/app/build/outputs/apk/release/app-release.apk${NC}"
        
        print_warning "Instalar en dispositivo:"
        echo "  adb install -r android/app/build/outputs/apk/release/app-release.apk"
        cd ..
        ;;
    
    release-no-minify)
        print_header "Generando APK Release (SIN minify - diagnóstico)"
        
        # Asegurar que minifyEnabled esté en false
        if grep -q "minifyEnabled true" android/app/build.gradle; then
            print_warning "minifyEnabled está en true. Cambiando a false para diagnóstico..."
            sed -i.bak 's/minifyEnabled true/minifyEnabled false/g' android/app/build.gradle
        fi
        
        cd android
        ./gradlew clean
        ./gradlew assembleRelease
        print_success "APK Release generado (SIN minify)"
        echo -e "${GREEN}Ubicación: android/app/build/outputs/apk/release/app-release.apk${NC}"
        
        print_warning "Instalar en dispositivo:"
        echo "  adb install -r android/app/build/outputs/apk/release/app-release.apk"
        
        print_warning "RECUERDA: Esto es solo para diagnóstico. Para producción, usa 'release' (con minify)."
        cd ..
        ;;
    
    logcat)
        print_header "Capturando logs en tiempo real"
        print_warning "Abre la app en tu Samsung ahora..."
        print_warning "Presiona Ctrl+C para detener"
        echo ""
        adb logcat | grep -E "(AndroidRuntime|ReactNative|portmanagement|CRASH|FATAL|MainActivity|SplashScreen)" --color=always
        ;;
    
    logcat-save)
        print_header "Guardando logs en archivo"
        LOGFILE="samsung_android14_crash_$(date +%Y%m%d_%H%M%S).txt"
        print_warning "Abre la app en tu Samsung ahora..."
        print_warning "Presiona Ctrl+C para detener y guardar"
        echo ""
        adb logcat > "$LOGFILE"
        print_success "Logs guardados en: $LOGFILE"
        ;;
    
    clean)
        print_header "Limpiando proyecto"
        cd android
        ./gradlew clean
        cd ..
        rm -rf android/app/build
        rm -rf node_modules/.cache
        print_success "Proyecto limpiado"
        ;;
    
    device-info)
        print_header "Información del dispositivo conectado"
        adb shell getprop ro.build.version.release | xargs echo "Android Version:"
        adb shell getprop ro.build.version.sdk | xargs echo "API Level:"
        adb shell getprop ro.product.manufacturer | xargs echo "Manufacturer:"
        adb shell getprop ro.product.model | xargs echo "Model:"
        adb shell getprop ro.build.version.one_ui | xargs echo "One UI Version:" 2>/dev/null || echo "One UI Version: N/A"
        ;;
    
    install-apk)
        print_header "Instalando APK en dispositivo"
        
        if [ ! -z "$2" ]; then
            APK_PATH="$2"
        else
            # Intentar encontrar el APK más reciente
            if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
                APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
            elif [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
                APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
            else
                print_error "No se encontró ningún APK. Genera uno primero con 'debug' o 'release'."
                exit 1
            fi
        fi
        
        print_warning "Instalando: $APK_PATH"
        adb install -r "$APK_PATH"
        print_success "APK instalado"
        
        print_warning "Inicia logcat para ver los logs:"
        echo "  ./test-samsung-android14.sh logcat"
        ;;
    
    full-test)
        print_header "Test Completo - Samsung Android 14"
        
        print_warning "PASO 1/5: Limpiando proyecto..."
        ./test-samsung-android14.sh clean
        
        print_warning "PASO 2/5: Verificando dispositivo conectado..."
        if ! adb devices | grep -q "device$"; then
            print_error "No hay dispositivo conectado. Conecta tu Samsung por USB."
            exit 1
        fi
        ./test-samsung-android14.sh device-info
        
        print_warning "PASO 3/5: Generando APK Release SIN minify (diagnóstico)..."
        ./test-samsung-android14.sh release-no-minify
        
        print_warning "PASO 4/5: Instalando en dispositivo..."
        ./test-samsung-android14.sh install-apk
        
        print_warning "PASO 5/5: Iniciando captura de logs..."
        print_warning "ABRE LA APP EN TU SAMSUNG AHORA"
        echo ""
        sleep 2
        ./test-samsung-android14.sh logcat
        ;;
    
    help|*)
        print_header "Script de Diagnóstico Samsung Android 14"
        echo ""
        echo -e "${YELLOW}Uso:${NC}"
        echo "  ./test-samsung-android14.sh [comando]"
        echo ""
        echo -e "${YELLOW}Comandos disponibles:${NC}"
        echo ""
        echo -e "  ${GREEN}debug${NC}              - Genera APK debug"
        echo -e "  ${GREEN}release${NC}            - Genera APK release CON minify (producción)"
        echo -e "  ${GREEN}release-no-minify${NC}  - Genera APK release SIN minify (diagnóstico)"
        echo -e "  ${GREEN}logcat${NC}             - Captura logs en tiempo real"
        echo -e "  ${GREEN}logcat-save${NC}        - Guarda logs en archivo"
        echo -e "  ${GREEN}clean${NC}              - Limpia el proyecto"
        echo -e "  ${GREEN}device-info${NC}        - Muestra info del dispositivo conectado"
        echo -e "  ${GREEN}install-apk${NC} [path] - Instala APK en dispositivo"
        echo -e "  ${GREEN}full-test${NC}          - Test completo automático"
        echo -e "  ${GREEN}help${NC}               - Muestra esta ayuda"
        echo ""
        echo -e "${YELLOW}Ejemplos:${NC}"
        echo ""
        echo -e "  ${BLUE}# Test rápido completo${NC}"
        echo "  ./test-samsung-android14.sh full-test"
        echo ""
        echo -e "  ${BLUE}# Generar y probar release sin minify${NC}"
        echo "  ./test-samsung-android14.sh release-no-minify"
        echo "  ./test-samsung-android14.sh install-apk"
        echo "  ./test-samsung-android14.sh logcat"
        echo ""
        echo -e "  ${BLUE}# Generar APK de producción${NC}"
        echo "  ./test-samsung-android14.sh release"
        echo ""
        echo -e "${YELLOW}Requisitos:${NC}"
        echo "  - Dispositivo Samsung conectado por USB"
        echo "  - USB debugging habilitado"
        echo "  - ADB instalado y en PATH"
        echo ""
        ;;
esac

