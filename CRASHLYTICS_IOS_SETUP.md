# 📱 Configuración de Crashlytics para iOS

## Pasos Necesarios

### 1. Instalar Pods

```bash
cd ios
pod install
cd ..
```

Esto instalará el pod de Firebase Crashlytics automáticamente.

### 2. Agregar Script de Build (IMPORTANTE)

Este script sube los símbolos de debug (dSYMs) a Firebase para que los stack traces sean legibles.

#### Usando Xcode:

1. Abre el proyecto en Xcode:

   ```bash
   cd ios
   open portmanagement.xcworkspace
   ```

2. En el navegador del proyecto (izquierda), selecciona **portmanagement**

3. Selecciona el target **portmanagement**

4. Ve a la pestaña **Build Phases**

5. Click en el **+** arriba a la izquierda → **New Run Script Phase**

6. Arrastra el nuevo script hasta **después de "Compile Sources"** pero **antes de "Copy Bundle Resources"**

7. Expande el script y pega esto:

```bash
"${PODS_ROOT}/FirebaseCrashlytics/run"
```

8. En **Input Files**, agrega:

```
${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${TARGET_NAME}
```

9. En **Output Files**, agrega:

```
${DERIVED_FILE_DIR}/${ARCH}/${TARGET_NAME}.framework.dSYM/Contents/Resources/DWARF/${TARGET_NAME}
```

10. Marca la casilla **"Based on dependency analysis"** (opcional pero recomendado)

#### Resultado Visual:

Tu Build Phases debería verse así:

```
- Compile Sources
- [New] Run Script: FirebaseCrashlytics  ← El que acabas de agregar
- Copy Bundle Resources
- Embed Frameworks
- ...
```

### 3. Habilitar dSYM Generation (Importante para Production)

1. En Xcode, con el proyecto seleccionado
2. Ve a **Build Settings**
3. Busca **"Debug Information Format"**
4. Para **Release**, selecciona **"DWARF with dSYM File"**
5. Para **Debug** puede quedar como está

### 4. Verificar que Google-Services está configurado

Asegúrate de tener el archivo `GoogleService-Info.plist` en tu proyecto:

```bash
# Verificar:
ls ios/portmanagement/GoogleService-Info.plist
```

Si no existe, descárgalo de Firebase Console:

1. Firebase Console → Project Settings
2. iOS apps → Descargar `GoogleService-Info.plist`
3. Arrástralo a Xcode en la carpeta `portmanagement`

### 5. Rebuild

```bash
# Limpiar build anterior
cd ios
rm -rf build
cd ..

# Rebuild
npm run ios
```

## Verificar que Está Configurado

### En Xcode:

1. Build Phases debe tener el script de FirebaseCrashlytics
2. Build Settings → Debug Information Format debe ser "DWARF with dSYM File" para Release

### En Terminal:

```bash
# Ver si el pod está instalado
cd ios
pod list | grep Crashlytics
cd ..
```

Deberías ver:

```
- FirebaseCrashlytics (versión)
```

## Troubleshooting iOS

### Crashes no aparecen en Firebase Console

**Problema**: Los crashes no se ven o aparecen sin stack trace legible.

**Solución**:

1. Verifica que el script de build esté agregado
2. Asegúrate de que dSYM generation esté habilitado
3. Haz un build de **Release** (no Debug)
4. Los crashes de Debug pueden no subirse correctamente

### Script de build falla

**Error**: `FirebaseCrashlytics/run: No such file or directory`

**Solución**:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### dSYMs no se suben

**Solución**: Para builds de producción, sube manualmente:

```bash
# Después de archivar en Xcode:
"${PODS_ROOT}/FirebaseCrashlytics/upload-symbols" \
  -gsp "${PROJECT_DIR}/portmanagement/GoogleService-Info.plist" \
  -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"
```

### App no compila después de agregar Crashlytics

**Solución**:

```bash
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
pod install
cd ..
npm run ios
```

## Testing en iOS

### 1. Simulador

```bash
npm run ios
```

Los crashes funcionan en el simulador, pero es mejor probar en dispositivo real.

### 2. Dispositivo Real (Recomendado)

```bash
# Conecta tu iPhone/iPad
npm run ios --device
```

O desde Xcode:

1. Selecciona tu dispositivo en la parte superior
2. Click en Run (⌘ + R)

### 3. Build de Release

Para testing más realista:

```bash
cd ios
xcodebuild -workspace portmanagement.xcworkspace \
  -scheme portmanagement \
  -configuration Release \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  build
```

## Builds de Producción

### TestFlight

Si usas TestFlight, los dSYMs se suben automáticamente con cada build.

### App Store

Los builds de App Store incluyen dSYMs automáticamente si:

- ✅ Tienes el script de build configurado
- ✅ Debug Information Format está en "DWARF with dSYM File"
- ✅ El build es de tipo Release

## Verificar Configuración Actual

### Script para verificar:

```bash
#!/bin/bash
echo "🔍 Verificando configuración de Crashlytics iOS..."
echo ""

# 1. Verificar Pods
echo "1. Verificando Pods..."
cd ios
if pod list | grep -q "FirebaseCrashlytics"; then
  echo "✅ FirebaseCrashlytics pod instalado"
else
  echo "❌ FirebaseCrashlytics pod NO instalado"
  echo "   Ejecuta: cd ios && pod install"
fi

# 2. Verificar GoogleService-Info.plist
echo ""
echo "2. Verificando GoogleService-Info.plist..."
if [ -f "portmanagement/GoogleService-Info.plist" ]; then
  echo "✅ GoogleService-Info.plist encontrado"
else
  echo "❌ GoogleService-Info.plist NO encontrado"
  echo "   Descárgalo de Firebase Console"
fi

cd ..
echo ""
echo "3. ⚠️  Verifica manualmente en Xcode:"
echo "   - Build Phases → Run Script con FirebaseCrashlytics"
echo "   - Build Settings → Debug Information Format = DWARF with dSYM File"
echo ""
```

Guarda esto como `check-crashlytics-ios.sh` y ejecútalo:

```bash
chmod +x check-crashlytics-ios.sh
./check-crashlytics-ios.sh
```

## Resumen

Para que Crashlytics funcione correctamente en iOS necesitas:

1. ✅ `pod install` (instala el pod)
2. ✅ Script de build en Xcode (sube dSYMs)
3. ✅ dSYM generation habilitado (stack traces legibles)
4. ✅ GoogleService-Info.plist (configuración de Firebase)

Sin el script de build (#2), los crashes se reportarán pero los stack traces serán ilegibles (solo direcciones de memoria).

## Siguiente Paso

1. Instala los Pods:

   ```bash
   cd ios && pod install && cd ..
   ```

2. Abre Xcode y agrega el script de build (pasos arriba)

3. Rebuild:

   ```bash
   npm run ios
   ```

4. Prueba un crash desde la pantalla de test

5. Verifica en Firebase Console que el stack trace sea legible
