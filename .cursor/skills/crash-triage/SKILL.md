---
name: crash-triage
description: Proceso de triage para crashes reportados en Crashlytics. Usar cuando hay crashes en producción, para investigar errores reportados, o priorizar fixes.
---

# Crash Triage

Proceso sistemático para investigar y priorizar crashes.

## Proceso de Triage

### 1. Recopilar Información

Desde Firebase Crashlytics Console:

```markdown
## Crash Report

- **Issue ID**: [ID de Crashlytics]
- **Versión afectada**: X.Y.Z
- **Usuarios afectados**: N
- **Ocurrencias**: M
- **Plataforma**: iOS / Android / Ambas
- **Primera vez**: [fecha]
- **Último reporte**: [fecha]
```

### 2. Analizar Stack Trace

```markdown
## Stack Trace Analysis

**Error Type**: [NullPointerException, TypeError, etc.]
**Mensaje**: [mensaje del error]

**Call Stack**:
1. [archivo:línea] - descripción
2. [archivo:línea] - descripción
3. ...

**Código Relevante**:
[snippet del código donde ocurre]
```

### 3. Clasificar Severidad

| Nivel | Criterio | Acción |
|-------|----------|--------|
| P0 - Crítico | >10% usuarios, bloquea uso | Fix inmediato |
| P1 - Alto | >1% usuarios, feature principal | Fix en 24-48h |
| P2 - Medio | <1% usuarios, feature secundaria | Próximo sprint |
| P3 - Bajo | Edge case, workaround existe | Backlog |

### 4. Identificar Root Cause

Preguntas a responder:

- ¿Qué acción del usuario desencadena el crash?
- ¿Es reproducible? ¿Pasos?
- ¿Qué cambió recientemente? (commits, deps)
- ¿Hay patrones? (dispositivo, OS version, idioma)

### 5. Documentar Fix

```markdown
## Fix Proposal

**Root Cause**: [explicación]

**Solución**:
- [ ] Archivo 1: cambio X
- [ ] Archivo 2: cambio Y

**Testing**:
- [ ] Test unitario para edge case
- [ ] Verificar en dispositivo afectado

**Rollout**:
- [ ] Hotfix vs release normal
- [ ] Feature flag si es riesgoso
```

## Template de Issue

```markdown
## [P1] Crash en HouseDetails al cargar imágenes

### Contexto
- 150 usuarios afectados (2%)
- Versión 1.9.5+
- Solo Android

### Stack Trace
```
TypeError: Cannot read property 'uri' of undefined
  at HousePhotos.js:45
  at renderImages
```

### Reproducción
1. Abrir house sin fotos
2. Scroll hacia galería
3. App crashea

### Root Cause
`house.photos` puede ser undefined cuando no hay fotos.

### Fix
Añadir null check en `HousePhotos.js:45`

### Verificación
- [ ] Test con house sin fotos
- [ ] Verificar en Android emulator
```
