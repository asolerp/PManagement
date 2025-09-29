#!/bin/bash

echo "🚀 Port Management - Build Release v1.9.5"
echo "=========================================="
echo ""
echo "¿Qué build quieres generar?"
echo "1) Android AAB (API 35)"
echo "2) iOS IPA"
echo "3) Ambos"
echo ""
read -p "Selecciona una opción (1-3): " choice

case $choice in
    1)
        echo "🤖 Generando build de Android..."
        ./build-android.sh
        ;;
    2)
        echo "🍎 Generando build de iOS..."
        ./build-ios.sh
        ;;
    3)
        echo "📱 Generando builds de Android e iOS..."
        echo ""
        echo "🤖 Generando Android..."
        ./build-android.sh
        echo ""
        echo "🍎 Generando iOS..."
        ./build-ios.sh
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Proceso completado!"
echo "📋 Resumen de cambios en v1.9.5:"
echo "   • Actualizado a Android API 35"
echo "   • Corregido bug de checklists de trabajadores"
echo "   • Reducido padding en ListItem"
echo "   • Mejorada compatibilidad con Google Play"
