# 🔧 Correcciones para Samsung Android 14 - Crashes al Arrancar

## ✅ Cambios Aplicados

### 1. **MainActivity.java** - SplashScreen API Nativa
- ✅ Agregado `SplashScreen.installSplashScreen(this)` ANTES de `super.onCreate()`
- ✅ Esto es CRÍTICO para Samsung Android 12+ (API 31+)
- ✅ Previene crashes relacionados con el splash screen en dispositivos Samsung

### 2. **MainApplication.java** - Flipper solo en DEBUG
- ✅ ReactNativeFlipper ahora solo se inicializa en builds DEBUG
- ✅ Previene crashes en release builds en Samsung Android 14
- ✅ Mejora el rendimiento en producción

### 3. **proguard-rules.pro** - Reglas completas de ProGuard
- ✅ Agregadas reglas específicas para Samsung Android 14+
- ✅ Protección para SplashScreen, RNBootSplash, y clases principales
- ✅ Reglas para Firebase, Google Play Services, CodePush, etc.
- ✅ Protección de métodos nativos, enums, parcelables

### 4. **styles.xml** - Compatibilidad Android 12+ Native Splash
- ✅ Agregados atributos `windowSplashScreenBackground` y `windowSplashScreenAnimatedIcon`
- ✅ Previene flashes de pantalla blanca en Samsung
- ✅ Compatibilidad total con la API nativa de Splash Screen

---

## 🧪 Cómo Probar los Cambios

### Opción A: Build de Prueba Sin Minify (Recomendado primero)

```bash
# 1. Limpia el proyecto
cd android
./gradlew clean
cd ..

# 2. Genera un APK debug en tu dispositivo
npx react-native run-android --variant=debug

# 3. Si funciona, prueba con release SIN minify
```

Asegúrate de que en `android/app/build.gradle` tengas:

```gradle
buildTypes {
  release {
    minifyEnabled false      // ⬅️ Sin minify para probar
    shrinkResources false
    ...
  }
}
```

### Opción B: Build Release Completo (Con Minify)

Si la Opción A funciona, activa minify:

```gradle
buildTypes {
  release {
    minifyEnabled true       // ⬅️ Con minify
    shrinkResources true
    ...
  }
}
```

Genera el build:

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔍 Diagnóstico Adicional (Si Aún Crashea)

### 1. Firebase Crashlytics (Método más efectivo)

Añade esto en `MainApplication.java` en el método `onCreate()`:

```java
@Override
public void onCreate() {
  super.onCreate();
  
  // Capturar todos los crashes
  Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
    FirebaseCrashlytics.getInstance().recordException(e);
    android.util.Log.e("CRASH", "Uncaught exception", e);
    throw new RuntimeException(e);
  });
  
  FirebaseCrashlytics.getInstance().log("App starting - MainActivity onCreate");
  
  // ... resto del código
}
```

### 2. Logcat en Tiempo Real

Conecta tu Samsung por USB y ejecuta:

```bash
# Ver logs en tiempo real
adb logcat | grep -E "(AndroidRuntime|ReactNative|portmanagement|CRASH)"

# O guardar en archivo
adb logcat > crash_log.txt
```

### 3. Pre-Launch Report en Play Console

1. Sube tu AAB a **Internal Testing** en Play Console
2. Espera ~1-2 horas
3. Ve a **Pre-launch report** → Busca Galaxy S21/S22 con Android 14
4. Verás video del crash + logcat completo

---

## 🚨 Problemas Específicos y Soluciones

### Problema: Crash inmediato al abrir (Pantalla negra)

**Causa probable:** SplashScreen API mal configurada

**Solución:** ✅ Ya aplicada en MainActivity.java

---

### Problema: Crash solo en Release builds

**Causa probable:** R8/ProGuard minificando clases necesarias

**Solución:** ✅ Ya aplicada en proguard-rules.pro

Si aún crashea, añade estas reglas adicionales:

```proguard
# Mantener TODA tu app (diagnóstico)
-keep class com.portmanagement.** { *; }

# Desactivar optimizaciones agresivas
-dontoptimize
```

---

### Problema: Flash de pantalla blanca antes del splash

**Causa probable:** windowBackground no configurado

**Solución:** ✅ Ya aplicada en styles.xml

---

### Problema: Crash relacionado con notificaciones

**Causa probable:** PendingIntent sin FLAG_IMMUTABLE

**Solución:** Si usas notificaciones o alarmas, asegúrate de:

```java
// En Android 12+ (API 31+)
PendingIntent pendingIntent = PendingIntent.getActivity(
    context,
    0,
    intent,
    PendingIntent.FLAG_IMMUTABLE  // ⬅️ OBLIGATORIO en Android 12+
);
```

---

### Problema: Crash relacionado con WorkManager o Jobs

**Causa probable:** Receiver sin android:exported

**Verifica en AndroidManifest.xml:**

```xml
<receiver android:name=".MyReceiver" android:exported="false">
  <!-- ... -->
</receiver>
```

---

## 📱 Información del Dispositivo de Prueba

Según la imagen:
- **Dispositivo:** Samsung Galaxy S21 (SM-S901B)
- **Android:** 14 (API 34)
- **One UI:** 6.0
- **Kernel:** 5.10.177

**Compatibilidad:** ✅ Tu app es 100% compatible (minSdk 23, target 35)

---

## 🎯 Checklist de Verificación

Antes de hacer el build final:

- [x] ✅ `SplashScreen.installSplashScreen()` en MainActivity
- [x] ✅ ReactNativeFlipper solo en DEBUG
- [x] ✅ proguard-rules.pro con reglas completas
- [x] ✅ styles.xml con atributos Android 12+
- [ ] 🔄 Probar APK debug en Samsung Android 14
- [ ] 🔄 Probar APK release sin minify
- [ ] 🔄 Probar APK release con minify
- [ ] 🔄 Verificar logs con adb logcat
- [ ] 🔄 Subir a Internal Testing para Pre-launch report

---

## 🆘 Si Nada Funciona

1. **Genera un build de diagnóstico:**

```gradle
buildTypes {
  release {
    minifyEnabled false
    shrinkResources false
    debuggable true  // ⬅️ Temporal para debugging
  }
}
```

2. **Instala en el Samsung y captura el crash:**

```bash
adb logcat -c  # Limpiar logs
# Abre la app en el Samsung
adb logcat > crash_detailed.txt
```

3. **Comparte el crash_detailed.txt** para análisis más profundo

---

## 📚 Recursos Adicionales

- [Android 12+ Splash Screen API](https://developer.android.com/develop/ui/views/launch/splash-screen)
- [Samsung One UI Compatibility](https://developer.samsung.com/one-ui)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

---

## 🎉 Siguiente Paso

```bash
# Limpia y genera un nuevo build
cd android
./gradlew clean
cd ..
npx react-native run-android --variant=release
```

Si el crash persiste, ejecuta `adb logcat` y comparte los logs.

