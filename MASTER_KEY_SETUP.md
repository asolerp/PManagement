# Configuración de Clave Maestra

## Descripción

Se ha implementado un sistema de "clave maestra" que permite acceder a cualquier cuenta usando cualquier email con una contraseña especial. Esto es útil para administradores que necesitan acceder a cuentas de usuarios sin conocer sus contraseñas.

## ⚠️ Consideraciones de Seguridad

**IMPORTANTE**: Esta funcionalidad es muy poderosa y debe usarse con precaución:

1. **Cambia la clave maestra por defecto** inmediatamente después de la implementación
2. **No compartas la clave maestra** con usuarios no autorizados
3. **Considera deshabilitar esta funcionalidad** en producción si no es necesaria
4. **Registra/loguea** todos los accesos con clave maestra para auditoría

## Configuración

### 1. Configurar la clave maestra en el servidor (Cloud Functions)

Tienes dos opciones:

#### Opción A: Usar Firebase Functions Config (Recomendado)

```bash
firebase functions:config:set master.key="TU_CLAVE_MAESTRA_SEGURA_AQUI"
```

Luego despliega las funciones:
```bash
firebase deploy --only functions
```

#### Opción B: Usar variables de entorno

Edita `functions/admin/masterKeyLogin.js` y cambia:
```javascript
const MASTER_KEY = process.env.MASTER_KEY || 'TU_CLAVE_MAESTRA_SEGURA_AQUI';
```

Y configura la variable de entorno en tu plataforma de despliegue.

### 2. Configurar la clave maestra en el cliente (App)

Edita `src/components/Forms/Auth/LoginForm.js` y cambia:
```javascript
const MASTER_KEY = 'TU_CLAVE_MAESTRA_SEGURA_AQUI';
```

**IMPORTANTE**: La clave maestra debe ser la misma en el cliente y en el servidor.

### 3. Alternativa: Usar variables de entorno en React Native

Para mayor seguridad, considera usar `react-native-config` o similar para manejar la clave maestra como variable de entorno:

```bash
npm install react-native-config
```

Luego crea un archivo `.env`:
```
MASTER_KEY=TU_CLAVE_MAESTRA_SEGURA_AQUI
```

Y en `LoginForm.js`:
```javascript
import Config from 'react-native-config';
const MASTER_KEY = Config.MASTER_KEY;
```

## Uso

1. Abre la pantalla de login
2. Ingresa **cualquier email** de usuario existente (o uno nuevo)
3. Ingresa la **clave maestra** como contraseña
4. Presiona "Iniciar sesión"

El sistema:
- Validará la clave maestra
- Si el usuario existe, creará un token de autenticación personalizado
- Si el usuario no existe, lo creará automáticamente con rol "admin" (puedes modificar esto en `masterKeyLogin.js`)

## Comportamiento

- **Usuario existe**: Se crea un custom token y se hace login como ese usuario
- **Usuario no existe**: Se crea el usuario automáticamente en Firebase Auth y Firestore con rol "admin" por defecto

## Personalización

### Cambiar el rol por defecto de usuarios nuevos

Edita `functions/admin/masterKeyLogin.js` línea ~45:
```javascript
role: 'admin', // Cambia 'admin' por el rol que prefieras
```

### Deshabilitar creación automática de usuarios

Si prefieres que solo funcione con usuarios existentes, edita `functions/admin/masterKeyLogin.js` y elimina el bloque `try-catch` que crea usuarios nuevos, dejando solo:

```javascript
userRecord = await admin.auth().getUserByEmail(email);
```

## Troubleshooting

### Error: "Clave maestra inválida"
- Verifica que la clave maestra sea la misma en cliente y servidor
- Asegúrate de haber desplegado las funciones después de cambiar la configuración

### Error: "Error al procesar el login con clave maestra"
- Verifica los logs de Firebase Functions
- Asegúrate de que Firebase Admin SDK tenga permisos para crear usuarios y tokens

### El login funciona pero no carga el usuario
- Verifica que el documento del usuario exista en Firestore
- Revisa los logs en `useAuth.js` para ver si hay errores al cargar datos del usuario

