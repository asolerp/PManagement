---
name: navigation-audit
description: Audita la estructura de navegación de React Navigation. Usar para revisar rutas, detectar problemas de deep linking, o reorganizar la navegación.
---

# Navigation Audit

Auditoría de la estructura de navegación.

## Proceso de Auditoría

### 1. Mapear Estructura Actual

Buscar archivos de navegación:

```bash
# Archivos de router/navigation
find src -name "*Router*" -o -name "*Navigator*" -o -name "*Stack*"
```

### 2. Documentar Árbol de Rutas

Crear mapa visual:

```
AppNavigator
├── AuthStack
│   ├── Login
│   ├── Register
│   └── ForgotPassword
└── MainTabs
    ├── HomeStack
    │   ├── Home
    │   └── Details
    ├── ProfileStack
    │   ├── Profile
    │   └── Settings
    └── ...
```

### 3. Checklist de Auditoría

```markdown
## Navigation Audit Checklist

### Estructura
- [ ] Navegadores anidados tienen sentido lógico
- [ ] No hay rutas duplicadas
- [ ] Nombres de rutas son consistentes (PascalCase)

### Deep Linking
- [ ] Rutas principales tienen path definido
- [ ] Params requeridos están documentados
- [ ] URLs son user-friendly

### Performance
- [ ] Lazy loading en stacks grandes
- [ ] No se pasan objetos grandes en params
- [ ] Reset de stack al cambiar de flujo

### UX
- [ ] Back button funciona correctamente
- [ ] Gestures habilitados donde corresponde
- [ ] Headers consistentes
```

### 4. Problemas Comunes

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Rutas huérfanas | Screen no accesible | Añadir navegación |
| Params perdidos | undefined en destino | Verificar navigate() |
| Stack infinito | Memory leak | Usar replace/reset |
| Deep link roto | URL no abre screen | Verificar linking config |

## Output Esperado

```markdown
## Navigation Audit Report

### Estructura
- Total navigators: X
- Total screens: Y
- Profundidad máxima: Z

### Issues Encontrados
1. [CRÍTICO] Ruta X no tiene deep link
2. [WARN] Stack Y tiene 10+ screens

### Recomendaciones
- Dividir HomeStack en sub-stacks
- Añadir linking config para rutas públicas
```
