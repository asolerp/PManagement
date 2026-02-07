# Logging & Crashlytics

Sistema de logging profesional integrado con Firebase Crashlytics.

## Uso

```javascript
import { Logger } from '../lib/logging';

// Logging básico
Logger.debug('Debug message');       // Solo en desarrollo
Logger.info('User logged in');       // Info general
Logger.warn('Low memory warning');   // Advertencias
Logger.error('Failed to fetch', error); // Errores (se envían a Crashlytics)
Logger.fatal('Critical failure', error); // Errores fatales

// Con contexto adicional
Logger.error('Payment failed', error, {
  userId: '123',
  amount: 99.99,
  currency: 'EUR'
});

// Mostrar toast al usuario
Logger.error('Network error', error, {}, { showToast: true });

// Breadcrumbs (trail de acciones para debugging)
Logger.breadcrumb('Opened checkout screen');
Logger.screenView('DashboardScreen');

// Context de usuario (se incluye en crash reports)
Logger.setUser({
  id: user.id,
  email: user.email,
  role: user.role
});

// Limpiar al logout
Logger.clearUser();
```

## Niveles de Log

| Nivel | Uso | Console | Crashlytics |
|-------|-----|---------|-------------|
| `debug` | Desarrollo/debugging | Solo __DEV__ | No |
| `info` | Eventos informativos | Solo __DEV__ | Sí (log) |
| `warn` | Advertencias | Solo __DEV__ | Sí (log) |
| `error` | Errores recuperables | Siempre | Sí (recordError) |
| `fatal` | Errores críticos | Siempre | Sí (recordError + severity) |

## Buenas Prácticas

### ✅ Hacer

```javascript
// Incluir contexto relevante
Logger.error('Failed to update checklist', error, {
  checklistId,
  userId,
  action: 'update'
});

// Usar breadcrumbs para tracking de flujos
Logger.breadcrumb('User started checkout');
Logger.breadcrumb('Added payment method', { type: 'card' });

// Usar debug para logs de desarrollo
Logger.debug('Rendering component', { props });
```

### ❌ No hacer

```javascript
// NO usar console.log directamente
console.log('debug info');  // ❌

// NO loguear datos sensibles
Logger.info('User data', { password: user.password }); // ❌

// NO usar strings genéricos
Logger.error('Error');  // ❌ - No da contexto
```

## Integración con Crashlytics

El Logger:

1. **En desarrollo (__DEV__)**: Muestra en console con formato legible
2. **En producción**: Envía a Crashlytics automáticamente

Los errores incluyen:
- Stack trace completo
- Contexto personalizado (atributos)
- Breadcrumbs previos
- Información del usuario

## API Completa

```typescript
Logger.debug(message: string, context?: object)
Logger.info(message: string, context?: object, options?: { showToast?: boolean })
Logger.warn(message: string, context?: object, options?: { showToast?: boolean })
Logger.error(message: string, error?: Error, context?: object, options?: { showToast?: boolean, toastMessage?: string })
Logger.fatal(message: string, error?: Error, context?: object)
Logger.breadcrumb(action: string, data?: object)
Logger.screenView(screenName: string)
Logger.setUser(user: { id: string, email?: string, role?: string })
Logger.clearUser()
Logger.setAttribute(key: string, value: string)
```

## Legacy Exports

Para compatibilidad con código existente:

```javascript
import { info, error, warn, success } from '../lib/logging';

// Estos funcionan igual pero usan Logger internamente
info({ message: 'text', asToast: true });
error({ message: 'text', asToast: true, data: errorObject });
```
