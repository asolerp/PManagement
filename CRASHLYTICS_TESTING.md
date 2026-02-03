# 🧪 Guía Rápida: Probar Crashlytics

## Acceso Rápido

He creado una pantalla especial para probar Crashlytics con diferentes tipos de errores.

### Para Acceder:

**Opción 1: Desde el código (temporal)**

En cualquier pantalla donde seas admin, agrega temporalmente:

```javascript
import { navigation } from '../Router/utils/actions';

// En un botón o useEffect:
navigation.navigate('CrashlyticsTestScreen');
```

**Opción 2: Agregar un botón en PageOptions**

La forma más fácil es agregar temporalmente un botón en la pantalla de opciones del admin.

## Tipos de Errores Disponibles

### 1. 💥 Crash Fatal
- **Qué hace**: Cierra la app inmediatamente
- **Cuándo usar**: Para probar crashes reales
- **Resultado**: La app se cierra y el crash aparece en Firebase Console

### 2. ⚠️ Error No Fatal
- **Qué hace**: Registra el error sin cerrar la app
- **Cuándo usar**: Para errores recuperables
- **Resultado**: Aparece en Crashlytics pero la app sigue funcionando

### 3. 📋 Error con Contexto
- **Qué hace**: Error con atributos personalizados
- **Cuándo usar**: Para ver cómo se registra información adicional
- **Resultado**: En Firebase verás los atributos (test_type, user_action, etc.)

### 4. ⏱️ Error Asíncrono
- **Qué hace**: Simula un error en una operación async
- **Cuándo usar**: Para probar errores en llamadas API, timeouts, etc.
- **Resultado**: Verás cómo se manejan errores asíncronos

### 5. 🔐 Error de Auth
- **Qué hace**: Simula un error de autenticación
- **Cuándo usar**: Para ver cómo se ven los errores de login
- **Resultado**: Error con código 'auth/user-not-found'

### 6. 🌐 Error de Red
- **Qué hace**: Simula un error de conexión
- **Cuándo usar**: Para errores de API/network
- **Resultado**: Error con información del endpoint

### 7. 📝 Error con Logs
- **Qué hace**: Crea varios logs antes del error
- **Cuándo usar**: Para ver el historial de lo que pasó antes del error
- **Resultado**: En Firebase verás todos los logs previos al error

## Cómo Ver los Resultados

### 1. Hacer el Test

1. Abre la app
2. Navega a CrashlyticsTestScreen
3. Presiona cualquier botón de prueba
4. Espera 1-2 minutos

### 2. Ver en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en **Crashlytics**
4. Verás la lista de crashes/errores

### 3. Ver Detalles

Para cada error verás:
- 📊 **Stack trace**: Líneas exactas de código
- 👤 **Usuario**: ID y email del usuario
- 📱 **Dispositivo**: Modelo, OS, versión
- 📝 **Logs**: Historial de lo que pasó
- 🏷️ **Atributos**: Información adicional (test_type, etc.)

## Formas Rápidas de Probar

### Método 1: Código Directo (Más Rápido)

Agrega esto temporalmente en cualquier pantalla:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// Error no fatal
try {
  throw new Error('Test error');
} catch (e) {
  crashlytics().recordError(e);
}

// Crash fatal
crashlytics().crash();
```

### Método 2: Console Dev Tools

En el emulador/simulador:

```javascript
// Abre la consola de React Native Debugger
// Ejecuta:
import('@react-native-firebase/crashlytics').then(crashlytics => {
  crashlytics.default().crash();
});
```

### Método 3: Causar Error Real

Simplemente rompe algo temporalmente:

```javascript
// Esto causará un crash real
const obj = null;
console.log(obj.property); // TypeError: Cannot read property of null
```

## Testing Checklist

Para probar completamente Crashlytics:

- [ ] Haz un crash fatal
- [ ] Espera que la app se cierre
- [ ] Reabre la app
- [ ] Espera 1-2 minutos
- [ ] Ve a Firebase Console → Crashlytics
- [ ] Verifica que veas el crash
- [ ] Haz un error no fatal
- [ ] Verifica que aparezca en "Non-fatals"
- [ ] Revisa que veas tu email de usuario
- [ ] Revisa que veas el dispositivo correcto

## Limpiar Después

⚠️ **IMPORTANTE**: Antes de hacer un build de producción:

1. **Elimina** `src/Screens/CrashlyticsTest/`
2. **Elimina** la referencia en `adminRouter.js`
3. **Elimina** cualquier botón de test que hayas agregado
4. **Busca** "crashlytics().crash()" en el código y elimínalo

```bash
# Buscar referencias:
grep -r "crashlytics().crash()" src/
grep -r "CrashlyticsTest" src/
```

## Troubleshooting

### No aparecen crashes

1. Asegúrate de haber esperado 1-2 minutos
2. Verifica que Crashlytics esté habilitado en Firebase Console
3. Asegúrate de que hiciste `npm install` y `pod install`
4. Rebuild la app completamente

### Solo aparecen en desarrollo

Los crashes de desarrollo pueden tardar más. Para testing real:
1. Haz un build de release
2. Instala en un dispositivo físico
3. Prueba ahí

### Crashes duplicados

Es normal. Firebase agrupa crashes similares automáticamente.

## Próximo Paso

Una vez que veas que funciona en Firebase Console:
1. ✅ Elimina la pantalla de test
2. ✅ La app ya está lista para producción
3. ✅ Verás crashes reales de usuarios automáticamente

---

**Nota**: Los crashes y errores se envían automáticamente. No necesitas hacer nada más después de la configuración inicial.

