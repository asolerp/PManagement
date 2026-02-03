# 🎯 Cómo Acceder a la Pantalla de Test de Crashlytics

## ✅ Método 1: Botón en el Dashboard (MÁS FÁCIL)

He agregado un botón flotante en el Dashboard de Admin:

### Pasos:
1. Abre la app
2. Haz login como **admin**
3. Ve al **Dashboard** (pantalla principal)
4. Verás **dos botones flotantes** en la esquina inferior izquierda:
   - 🗑️ **Papelera** (el de arriba)
   - 🐛 **Bug Report** (el de abajo) ← Este es el de Crashlytics Test
5. Presiona el botón con el ícono de **bug** 🐛
6. Se abrirá la pantalla de test de Crashlytics

## 🖥️ Método 2: Consola de React Native Debugger

Si tienes React Native Debugger abierto:

```javascript
// En la consola, ejecuta:
require('./src/Router/utils/actions').navigation.navigate('CrashlyticsTestScreen');
```

## 📱 Método 3: Código Temporal

Si prefieres agregar un botón en otra pantalla:

```javascript
import { openScreenWithPush } from '../../Router/utils/actions';
import { CRASHLYTICS_TEST_SCREEN_KEY } from '../../Screens/CrashlyticsTest';

// En tu componente:
<TouchableOpacity 
  onPress={() => openScreenWithPush(CRASHLYTICS_TEST_SCREEN_KEY)}
>
  <Text>Test Crashlytics</Text>
</TouchableOpacity>
```

## 🧪 Una Vez en la Pantalla de Test

Verás 7 botones:

1. **💥 Crash Fatal** (Rojo) - Cierra la app
2. **⚠️ Error No Fatal** (Azul) - No cierra la app
3. **📋 Error con Contexto** (Azul)
4. **⏱️ Error Asíncrono** (Azul)
5. **🔐 Error de Auth** (Azul)
6. **🌐 Error de Red** (Azul)
7. **📝 Error con Logs** (Azul)

### Recomendado para Primera Prueba:

1. Presiona **"⚠️ Error No Fatal"**
2. Verás un alert: "Error Registrado"
3. Espera 1-2 minutos
4. Ve a [Firebase Console → Crashlytics](https://console.firebase.google.com/)
5. Verás el error reportado

### Para Probar Crash Real:

1. Presiona **"💥 Crash Fatal"**
2. Confirma en el alert
3. La app se cerrará
4. Reabre la app
5. Espera 1-2 minutos
6. Ve a Firebase Console → Crashlytics
7. Verás el crash reportado

## 🧹 Limpiar Después del Testing

Una vez que confirmes que funciona, **ELIMINAR antes de producción**:

### 1. Eliminar el botón del Dashboard:

Edita `src/Screens/Dashboard/DashboardScreen.js` y elimina estas líneas:

```javascript
// Busca y elimina:
{/* ⚠️ TEMPORAL: Botón para probar Crashlytics - ELIMINAR EN PRODUCCIÓN */}
<AddButton
  containerStyle={[theme.left5, { bottom: 100 }]}
  iconName="bug-report"
  onPress={() => openScreenWithPush(CRASHLYTICS_TEST_SCREEN_KEY)}
/>
```

Y también elimina el import:
```javascript
import { CRASHLYTICS_TEST_SCREEN_KEY } from '../CrashlyticsTest';
```

### 2. Eliminar la pantalla de test:

```bash
rm -rf src/Screens/CrashlyticsTest/
```

### 3. Eliminar del router:

Edita `src/Router/adminRouter.js` y elimina:

```javascript
// Import:
import CrashlyticsTestScreen from '../Screens/CrashlyticsTest/CrashlyticsTestScreen';
import { CRASHLYTICS_TEST_SCREEN_KEY } from '../Screens/CrashlyticsTest';

// Screen:
<Screen
  name={CRASHLYTICS_TEST_SCREEN_KEY}
  component={CrashlyticsTestScreen}
  options={{ headerShown: false }}
/>
```

## 📊 Ver Resultados en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en **Crashlytics** en el menú lateral
4. Verás:
   - Lista de crashes/errores
   - Número de usuarios afectados
   - Dispositivos y versiones
   - Stack traces completos

## ⚡ Alternativa Rápida (Sin UI)

Si solo quieres verificar que Crashlytics funciona sin UI:

Agrega esto temporalmente en cualquier `useEffect`:

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

useEffect(() => {
  // Espera 2 segundos y envía un error de prueba
  setTimeout(() => {
    try {
      throw new Error('Test automático de Crashlytics');
    } catch (e) {
      crashlytics().recordError(e);
      console.log('Error enviado a Crashlytics');
    }
  }, 2000);
}, []);
```

---

## 🎉 ¡Listo!

Ahora tienes acceso fácil a la pantalla de test. Prueba cualquier tipo de error y verás los resultados en Firebase Console en 1-2 minutos.

