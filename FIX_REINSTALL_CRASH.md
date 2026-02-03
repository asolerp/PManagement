# Solución: App se cierra después de reinstalar

## Problema

Cuando un usuario desinstala y reinstala la app, a veces se cierra inmediatamente. Esto sucede porque:

1. **Firebase Auth guarda la sesión** en Keychain (iOS) o Keystore (Android)
2. **La sesión NO se borra** al desinstalar la app
3. Al reinstalar, la app intenta cargar el usuario pero:
   - El documento de Firestore puede estar corrupto
   - Puede faltar información necesaria
   - Puede haber errores de permisos

## Solución Implementada

### 1. Manejo de Errores en `useAuth.js`

Se agregó manejo completo de errores en el hook de autenticación que:

- ✅ Captura errores al obtener el documento de Firestore
- ✅ Captura errores al actualizar el token de messaging
- ✅ Hace logout automático si algo falla
- ✅ Crea el documento si no existe
- ✅ Registra todos los errores en console para debug

**Archivo modificado**: `src/Router/hooks/useAuth.js`

### 2. Cómo Funciona Ahora

```javascript
// Si hay un error al cargar el usuario:
1. Se registra el error en console.error()
2. Se hace logout automático: auth().signOut()
3. El usuario ve la pantalla de login (en lugar de crash)
```

### 3. Para el Usuario Final

Si un usuario reporta que la app se cierra al reinstalar:

**Solución Rápida:**

1. Abrir la app
2. Intentar hacer login manualmente
3. Si persiste, limpiar datos de la app:
   - **iOS**: Desinstalar y reinstalar + Reiniciar el dispositivo
   - **Android**: Settings → Apps → [Tu App] → Storage → Clear Data

**Prevención:**

- La app ahora maneja estos errores automáticamente
- El usuario verá la pantalla de login en lugar de un crash

### 4. Para Desarrollo/Testing

Si necesitas limpiar completamente la sesión:

**iOS Simulator:**

```bash
# Limpiar todo el simulador
xcrun simctl erase all

# O limpiar solo tu app
xcrun simctl uninstall booted com.tu.bundle.id
```

**Android Emulator:**

```bash
# Limpiar datos de la app
adb shell pm clear com.tu.package.name

# O desinstalar completamente
adb uninstall com.tu.package.name
```

**Físico (iOS y Android):**

1. Desinstalar la app
2. Reiniciar el dispositivo (importante para limpiar keychain/keystore)
3. Reinstalar la app

### 5. Logs para Debug

Cuando ocurre un error, verás en la consola:

```
Error fetching user document: [error details]
// O
Error updating user document: [error details]
// O
Error getting messaging token: [error details]
// O
User authenticated but no Firestore document found, creating one...
```

Estos logs te ayudarán a identificar el problema específico.

### 6. Casos de Uso Cubiertos

✅ Usuario sin documento en Firestore → Se crea automáticamente
✅ Error al obtener token de messaging → Se carga sin token
✅ Error de permisos en Firestore → Logout y mostrar login
✅ Documento corrupto → Logout y mostrar login
✅ Error de red → Se reintenta automáticamente (por Firebase)

## Testing

Para probar que funciona correctamente:

1. **Crear escenario de error:**

   ```javascript
   // En Firebase Console → Firestore
   // Borra el documento del usuario en la colección 'users'
   ```

2. **Reinstalar la app:**

   - La app debería hacer logout automático
   - Mostrar pantalla de login
   - NO debería crashear

3. **Hacer login nuevamente:**
   - Se crea el documento automáticamente
   - Todo funciona normal

## Nota Importante

Este fix es **retroactivo**: funcionará para todos los usuarios que ya tienen la app instalada y para nuevas instalaciones. No requiere que los usuarios reinstalen la app.
