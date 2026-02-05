---
name: firebase-functions-emulator
description: Configura y ejecuta Firebase Emulator Suite para desarrollo local. Usar cuando el usuario quiera probar Functions, Firestore o Auth sin afectar producción.
---

# Firebase Emulator Setup

## Prerequisitos

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (si no existe firebase.json)
firebase init emulators
```

## Configuración

### firebase.json

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Conectar App a Emulators

```javascript
// En App.js o config inicial
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

if (__DEV__) {
  // Para iOS simulator
  const localhost = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  
  auth().useEmulator(`http://${localhost}:9099`);
  firestore().useEmulator(localhost, 8080);
  functions().useEmulator(localhost, 5001);
}
```

## Comandos

```bash
# Iniciar todos los emulators
firebase emulators:start

# Solo algunos
firebase emulators:start --only functions,firestore

# Con data persistente
firebase emulators:start --import=./emulator-data --export-on-exit

# Ver UI
# http://localhost:4000
```

## Seed Data

```bash
# Exportar data actual
firebase emulators:export ./emulator-data

# Importar al iniciar
firebase emulators:start --import=./emulator-data
```

## Troubleshooting

### Port in Use

```bash
# Verificar puertos
lsof -i :8080
lsof -i :5001

# Matar proceso
kill -9 <PID>
```

### Functions No Conectan

1. Verificar que `useEmulator` se llama antes de cualquier operación
2. Para device físico, usar IP de la máquina (no localhost)
3. Verificar firewall permite conexiones

### Firestore Rules

```bash
# Las rules se cargan de firestore.rules
# Modificar y emulator las recarga automáticamente
```

## Checklist

- [ ] Firebase CLI instalado
- [ ] `firebase.json` con emulators configurados
- [ ] App conecta a emulators en `__DEV__`
- [ ] Seed data disponible para testing
- [ ] UI accesible en http://localhost:4000
