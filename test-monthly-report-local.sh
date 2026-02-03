#!/bin/bash

echo "🧪 Probando Monthly Report localmente con Firebase Emulator"
echo ""
echo "Paso 1: Iniciando emulador de funciones..."
echo "(Presiona Ctrl+C para detener después de la prueba)"
echo ""

cd functions

# Iniciar el emulador en segundo plano
npm run serve &
EMULATOR_PID=$!

# Esperar a que el emulador inicie
sleep 10

echo ""
echo "Paso 2: Llamando a testMonthlyReport..."
echo ""

# Llamar a la función en el emulador (normalmente en puerto 5001)
curl -X POST http://localhost:5001/port-management-9bd53/europe-west1/testMonthlyReport \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo ""
echo "✅ Prueba completada"
echo ""
echo "Presiona Enter para detener el emulador..."
read

# Detener el emulador
kill $EMULATOR_PID

