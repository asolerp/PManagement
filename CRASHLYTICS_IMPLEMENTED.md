# ✅ Firebase Crashlytics - Instalación Completada

## Cambios Realizados

### 1. Dependencias Agregadas

**`package.json`**:

```json
"@react-native-firebase/crashlytics": "18.6.1"
```

### 2. Configuración Android

**`android/build.gradle`**:

```gradle
classpath("com.google.firebase:firebase-crashlytics-gradle:2.9.9")
```

**`android/app/build.gradle`**:

```gradle
apply plugin: "com.google.firebase.crashlytics"
```

### 3. Código Actualizado

✅ **`src/App.js`**:

- Importado Crashlytics
- Inicializado al arrancar la app
- Agregado error handler personalizado
- Registro de información del dispositivo

✅ **`src/Router/hooks/useAuth.js`**:

- Registra errores de autenticación
- Agrega información del usuario a Crashlytics
- Limpia información al hacer logout

✅ **`src/components/Forms/Auth/LoginForm.js`**:

- Registra errores de login
- Distingue entre login normal y master key
- Agrega contexto útil

## Próximos Pasos

### 1. Instalar Dependencias

```bash
# En la raíz del proyecto
npm install

# Pods de iOS
cd ios && pod install && cd ..

# Limpiar build de Android
cd android && ./gradlew clean && cd ..
```

### 2. Habilitar Crashlytics en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "Port Management"
3. Click en **"Crashlytics"** en el menú lateral
4. Click en **"Habilitar Crashlytics"**
5. Acepta los términos

### 3. Rebuild de la App

```bash
# Android
npm run android

# iOS
npm run ios
```

### 4. Probar que Funciona

#### Método 1: Crash Forzado (solo para testing)

Agrega temporalmente en cualquier pantalla:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

<Button title="Test Crash" onPress={() => crashlytics().crash()} />;
```

#### Método 2: Error No Fatal

```javascript
try {
  throw new Error('Test error from Crashlytics');
} catch (e) {
  crashlytics().recordError(e);
}
```

### 5. Ver Crashes en Firebase Console

1. Haz un crash de prueba
2. Espera 1-2 minutos
3. Ve a Firebase Console → Crashlytics
4. Deberías ver el crash reportado con:
   - Stack trace completo
   - Información del dispositivo
   - Información del usuario
   - Logs personalizados

## Información que se Registra Automáticamente

### En cada sesión:

- ✅ Platform (iOS/Android)
- ✅ Platform version
- ✅ Device model
- ✅ OS version
- ✅ App version

### Al autenticarse:

- ✅ User ID
- ✅ Email
- ✅ Logs de autenticación

### Al hacer login:

- ✅ Método de login (normal vs master_key)
- ✅ Email usado
- ✅ Errores específicos

### En errores de auth:

- ✅ Errores al obtener usuario de Firestore
- ✅ Errores al actualizar token
- ✅ Errores al crear documento

## Configurar Alertas (Opcional)

1. Firebase Console → Crashlytics
2. Click en ⚙️ (settings)
3. Configura alertas por email para:
   - Nuevos crashes
   - Aumento repentino en crashes
   - Regresiones (crashes que reaparecen)

## Troubleshooting

### Si no aparecen crashes en iOS:

1. Asegúrate de tener dSYM symbols habilitados
2. En Xcode: Build Settings → Debug Information Format → DWARF with dSYM File
3. Rebuild la app

### Si no aparecen crashes en Android:

1. Verifica que el plugin esté correctamente aplicado
2. Haz un clean build: `cd android && ./gradlew clean`
3. Rebuild la app

### Crashes tardan en aparecer:

- Los crashes pueden tardar 1-5 minutos en aparecer en la consola
- Para testeo, usa builds de Release (no Debug)
- Los crashes de Debug pueden no subirse correctamente

## Ver Estadísticas

En Firebase Console → Crashlytics verás:

- 📊 **Crash-free users**: % de usuarios sin crashes
- 👥 **Usuarios afectados**: Quiénes tienen crashes
- 📱 **Dispositivos**: Modelos y OS versions
- 🔥 **Crash más frecuente**: El que afecta a más usuarios
- 📈 **Tendencias**: Comparación con períodos anteriores

## Comandos Útiles

```bash
# Reinstalar todo desde cero
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..

# Limpiar builds
cd android && ./gradlew clean && cd ..
rm -rf ios/build

# Ver logs de Crashlytics
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## Resultado Final

Con Crashlytics implementado:

✅ **Visibilidad Total**: Verás todos los crashes en producción
✅ **Información del Usuario**: Sabrás exactamente quién tiene problemas
✅ **Stack Traces**: Debugging completo con líneas de código exactas
✅ **Priorización**: Sabrás qué bugs afectan a más usuarios
✅ **Alertas**: Recibirás notificaciones de nuevos crashes
✅ **Contexto**: Logs y atributos personalizados para cada crash
✅ **Dispositivos**: Sabrás en qué devices ocurren problemas

## Nota Importante

⚠️ **No olvides quitar botones de test antes de subir a producción**

Los botones o código de prueba como `crashlytics().crash()` deben ser eliminados antes de hacer un build de producción.

## Próximo Deploy

Cuando hagas un nuevo deploy:

1. Los crashes nuevos se verán automáticamente en Firebase Console
2. Recibirás alertas por email (si las configuraste)
3. Podrás ver trends y comparar con versiones anteriores
4. Los usuarios reportarán menos bugs porque los verás antes

---

🎉 **¡Crashlytics está listo!**

Ya puedes ver todos los crashes y errores en tiempo real en Firebase Console.
