# Seed datos para admin dashboard (admin@admin.es)

Script que rellena la base de datos con datos de demostración para poder ver en el dashboard:

- **Estado del día**: incidencias abiertas, trabajos de hoy, revisiones en curso, jornadas en curso
- **SLA en riesgo**: incidencias y trabajos con SLA at_risk o incumplido
- **Incidencias**: filtro Estancadas (días sin cambio), SLA en riesgo, Sin asignar
- **Trabajos**: de hoy pendientes y completados
- **Jornadas**: una en curso y una completada hoy

## Requisitos

- Usuario en Firebase Auth con email **admin@admin.es**
- Documento en `users/{uid}` con `role: 'admin'` y `companyId` (p. ej. creado con la Cloud Function `registerCompany`)

## Uso

Desde la raíz del repo, con cuenta de servicio (Firebase Console → Project settings → Service accounts → Generate new private key):

```bash
cd functions
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu-key.json node migrations/seedAdminDashboardData.js
```

El script detecta el `companyId` del usuario **admin@admin.es** y crea todos los datos en esa empresa.

### Usar un companyId concreto

Si quieres sembrar una empresa sin depender del email:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu-key.json node migrations/seedAdminDashboardData.js <companyId>
```

## Qué crea

- **Companies**: si falta, actualiza SLAs por defecto (24h respuesta, 72h resolución).
- **Properties**: 3 casas (Casa Norte, Casa Sur, Apartamento Centro) solo si la empresa no tiene ninguna.
- **Users**: 2 trabajadores demo (solo Firestore, sin Auth) si no hay workers.
- **Incidents**: 5 incidencias (2 estancadas, SLA en riesgo, SLA incumplido, sin asignar).
- **Jobs**: 3 trabajos (hoy pendiente, hoy hecho, SLA en riesgo).
- **Checklists**: 1 revisión en curso (2/5 puntos hechos).
- **workShifts**: 2 jornadas de hoy (1 en curso, 1 completada).

El script es **idempotente** por empresa: si ya hay datos (propiedades, incidencias, etc.), no duplica.

## Después del seed

Inicia sesión en el admin dashboard con **admin@admin.es** y comprueba:

1. **Dashboard**: Estado del día, widget SLA en riesgo, estadísticas y jornadas.
2. **Incidencias**: pestañas Abiertas/Cerradas, filtros SLA en riesgo, Sin asignar, **Estancadas**, y por casa.
3. **Trabajos**: listado con trabajos de hoy y SLA.
4. **Checklists**: revisiones en curso.
5. **Jornadas**: jornadas de hoy en curso y completadas.
