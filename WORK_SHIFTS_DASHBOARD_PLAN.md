# Plan: Sistema de Jornadas Laborales + Dashboard Admin

## Resumen

Sistema para gestionar jornadas laborales de trabajadores, calculando automáticamente la primera entrada y última salida del día como una jornada laboral. Incluye un dashboard web para administradores.

---

## Parte 1: Lógica de Negocio - Jornadas Laborales

### 1.1 Estructura de Datos Actual

```
entrances (colección existente)
├── {entranceId}
│   ├── worker: { id, name, email, ... }
│   ├── date: Timestamp (hora de entrada)
│   ├── exitDate: Timestamp | null (hora de salida)
│   ├── location: { latitude, longitude }
│   ├── exitLocation: { latitude, longitude }
│   ├── images: [{ url }, { url }]
│   └── house: { id, houseName } (opcional)
```

### 1.2 Nueva Estructura: Jornadas Calculadas

**Opción A: Colección separada `workShifts`** (Recomendada)

```
workShifts (nueva colección)
├── {shiftId}
│   ├── workerId: string
│   ├── workerName: string
│   ├── workerEmail: string
│   ├── date: string (formato: "2026-02-05")
│   ├── firstEntry: Timestamp
│   ├── lastExit: Timestamp | null
│   ├── totalMinutes: number
│   ├── status: "in_progress" | "completed"
│   ├── entranceIds: string[] (referencias a entrances)
│   ├── entryLocation: { latitude, longitude }
│   ├── exitLocation: { latitude, longitude }
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
```

**Ventajas:**
- Queries rápidos por fecha y trabajador
- Histórico limpio de jornadas
- No modifica estructura existente
- Fácil de reportar y exportar

### 1.3 Cloud Functions Necesarias

#### `onEntranceCreated` - Trigger al crear entrada

```javascript
// Cuando se crea una nueva entrada:
// 1. Buscar si existe workShift para ese trabajador/fecha
// 2. Si NO existe → Crear nuevo workShift con firstEntry
// 3. Si existe → Actualizar entranceIds
```

#### `onEntranceUpdated` - Trigger al actualizar (salida)

```javascript
// Cuando se registra una salida (exitDate):
// 1. Buscar workShift del trabajador/fecha
// 2. Actualizar lastExit si es más tarde que la actual
// 3. Calcular totalMinutes
// 4. Actualizar status a "completed" si aplica
```

#### `calculateDailyShifts` - Función programada (cron)

```javascript
// Ejecutar cada noche a las 23:59:
// 1. Buscar entradas del día sin salida registrada
// 2. Marcar jornadas incompletas
// 3. Generar alertas si es necesario
```

#### `getWorkShifts` - API para el dashboard

```javascript
// Callable function para consultar jornadas:
// Parámetros: startDate, endDate, workerId?, houseId?
// Retorna: Array de workShifts con datos agregados
```

---

## Parte 2: Dashboard Web (React + Vite)

### 2.1 Estructura del Proyecto

```
/admin-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── .env.local
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useWorkShifts.js
│   │   └── useWorkers.js
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── Auth/
│   │   │   └── LoginForm.jsx
│   │   ├── WorkShifts/
│   │   │   ├── ShiftTable.jsx
│   │   │   ├── ShiftCard.jsx
│   │   │   ├── ShiftFilters.jsx
│   │   │   └── ShiftStats.jsx
│   │   └── common/
│   │       ├── DateRangePicker.jsx
│   │       ├── WorkerSelector.jsx
│   │       └── ExportButton.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── WorkShiftsPage.jsx
│   │   └── WorkersPage.jsx
│   ├── services/
│   │   └── api.js
│   └── styles/
│       └── globals.css
└── public/
    └── favicon.ico
```

### 2.2 Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router 6 |
| State | TanStack Query 5 |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Firebase Auth |
| Backend | Firebase Functions (callable) |
| Charts | Recharts |
| Tables | TanStack Table |
| Date | date-fns |

### 2.3 Funcionalidades del Dashboard

#### Pantalla Principal (Dashboard)

- **Resumen del día**
  - Total trabajadores activos
  - Jornadas completadas / en curso
  - Horas totales trabajadas
  
- **Gráficos**
  - Horas por trabajador (semana)
  - Tendencia de asistencia (mes)

#### Pantalla de Jornadas (WorkShifts)

- **Tabla de jornadas**
  - Filtros: fecha, trabajador, estado
  - Columnas: Trabajador, Fecha, Entrada, Salida, Total, Estado
  - Acciones: Ver detalle, Exportar
  
- **Filtros avanzados**
  - Rango de fechas
  - Selector de trabajadores
  - Estado (completada/en curso/incompleta)

- **Exportación**
  - Excel (usar función existente)
  - PDF (nuevo)

#### Pantalla de Trabajadores

- **Lista de trabajadores**
  - Foto, nombre, email
  - Horas totales del mes
  - Estado actual (trabajando/no)

### 2.4 Autenticación y Roles

```javascript
// Solo usuarios con role: "admin" pueden acceder
// Usar Custom Claims de Firebase Auth

// En Cloud Function:
admin.auth().setCustomUserClaims(uid, { role: 'admin' });

// En Dashboard:
const { claims } = await user.getIdTokenResult();
if (claims.role !== 'admin') {
  // Redirect to unauthorized
}
```

---

## Parte 3: Plan de Implementación

### Fase 1: Backend (Firebase Functions)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Crear trigger `onEntranceCreated` | Alta | - |
| Crear trigger `onEntranceUpdated` | Alta | - |
| Crear función `getWorkShifts` | Alta | - |
| Crear función scheduled nocturna | Media | - |
| Tests con emulador | Alta | - |

### Fase 2: Dashboard - Setup

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Crear proyecto Vite + React | Alta | - |
| Configurar Tailwind + shadcn/ui | Alta | - |
| Configurar Firebase SDK web | Alta | - |
| Implementar autenticación | Alta | - |
| Layout base (Sidebar, Header) | Alta | - |

### Fase 3: Dashboard - Features

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Página Dashboard con stats | Alta | - |
| Página WorkShifts con tabla | Alta | - |
| Filtros y búsqueda | Media | - |
| Exportación Excel | Media | - |
| Gráficos de asistencia | Baja | - |

### Fase 4: Integración y Deploy

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Deploy Functions a producción | Alta | - |
| Configurar Firebase Hosting | Alta | - |
| Deploy Dashboard | Alta | - |
| Testing E2E | Media | - |

---

## Parte 4: Decisiones Tomadas

1. **Jornadas incompletas**: ✅ Admin puede corregir/añadir manualmente desde el panel
2. **Múltiples entradas/salidas**: ✅ Primera entrada del día → Última salida del día
3. **Acceso al dashboard**: ✅ Solo administradores
4. **Histórico**: ✅ Migrar datos existentes de `entrances` a `workShifts`
5. **Hosting**: Firebase Hosting

---

## Archivos a Crear/Modificar

### Nuevos archivos en `/functions/`

```
functions/
├── workShifts/
│   ├── index.js              # Exports
│   ├── onEntranceCreated.js  # Trigger
│   ├── onEntranceUpdated.js  # Trigger
│   ├── getWorkShifts.js      # API callable
│   ├── calculateDaily.js     # Scheduled
│   └── utils.js              # Helpers
```

### Nuevo proyecto `/admin-dashboard/`

```
admin-dashboard/
├── (estructura completa arriba)
```

---

## Comandos de Inicio

```bash
# 1. Crear dashboard
cd /Users/alberto/Desktop/Proyectos/PManagement
npm create vite@latest admin-dashboard -- --template react
cd admin-dashboard
npm install

# 2. Instalar dependencias
npm install firebase @tanstack/react-query @tanstack/react-table
npm install react-router-dom date-fns recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Instalar shadcn/ui
npx shadcn-ui@latest init

# 4. Configurar Firebase Hosting
firebase init hosting
# Seleccionar admin-dashboard/dist como directorio público
```

---

## Notas Técnicas

### Índices de Firestore necesarios

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "workShifts",
      "fields": [
        { "fieldPath": "workerId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "workShifts",
      "fields": [
        { "fieldPath": "date", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### Reglas de Firestore

```javascript
// Solo admins pueden leer workShifts
match /workShifts/{shiftId} {
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if false; // Solo Functions
}
```
