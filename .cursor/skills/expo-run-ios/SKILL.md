---
name: expo-run-ios
description: Construye y ejecuta la app en iOS simulator o device. Usar cuando el usuario quiera probar en iOS, debug en simulator, o verificar cambios nativos iOS.
---

# Expo Run iOS

## Prerequisitos

- macOS con Xcode instalado
- CocoaPods (`sudo gem install cocoapods`)
- Simulador iOS configurado

## Comando Principal

```bash
# Run en simulator (default)
npx expo run:ios

# Especificar device/simulator
npx expo run:ios --device "iPhone 15 Pro"

# Build de release
npx expo run:ios --configuration Release
```

## Troubleshooting

### Pod Install Falla

```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

### Clean Build

```bash
# Limpiar derivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Prebuild limpio
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

### Signing Issues

1. Abrir `ios/portmanagement.xcworkspace` en Xcode
2. Seleccionar target > Signing & Capabilities
3. Configurar Team y Bundle ID

## Logs

```bash
# Ver logs del simulator
npx react-native log-ios

# O desde Console.app filtrando por app name
```

## Checklist Pre-Run

- [ ] `npx expo prebuild` ejecutado si hay cambios nativos
- [ ] Pods instalados (`cd ios && pod install`)
- [ ] Simulator disponible
- [ ] Xcode command line tools configurados
