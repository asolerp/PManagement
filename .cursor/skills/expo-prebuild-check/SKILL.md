---
name: expo-prebuild-check
description: Verifica y regenera proyectos nativos con Expo Prebuild. Usar después de añadir dependencias nativas, modificar app.json, o cuando builds fallen por inconsistencias nativas.
---

# Expo Prebuild Check

## Cuándo Usar Prebuild

- Añadiste una dependencia con código nativo
- Modificaste `app.json` o `app.config.js`
- Cambiaste plugins de Expo
- Build nativo falla con errores extraños

## Comandos

```bash
# Prebuild normal (mantiene cambios manuales)
npx expo prebuild

# Prebuild limpio (BORRA y regenera todo)
npx expo prebuild --clean

# Solo una plataforma
npx expo prebuild --platform ios
npx expo prebuild --platform android
```

## Verificación Post-Prebuild

```bash
# iOS
cd ios && pod install && cd ..

# Verificar que compila
npx expo run:ios --no-build-cache

# Android
cd android && ./gradlew assembleDebug && cd ..
```

## Archivos Importantes

```
app.json / app.config.js
├── expo.plugins[]          # Plugins que modifican nativos
├── expo.ios.bundleIdentifier
├── expo.android.package
└── expo.ios.infoPlist      # Permisos y configs iOS
```

## Config Plugins Comunes

```javascript
// app.json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          "ios": { "useFrameworks": "static" },
          "android": { "compileSdkVersion": 34 }
        }
      ]
    ]
  }
}
```

## Troubleshooting

### "Native module not found"

```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

### Conflictos de versión

```bash
# Verificar compatibilidad
npx expo-doctor

# Actualizar dependencias
npx expo install --fix
```

## Checklist

- [ ] `app.json` tiene todos los plugins necesarios
- [ ] Ejecutar `npx expo prebuild --clean` después de cambios
- [ ] `pod install` en iOS
- [ ] Verificar build en ambas plataformas
