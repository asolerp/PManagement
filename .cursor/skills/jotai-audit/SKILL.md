---
name: jotai-audit
description: Audita el estado global con Jotai - detecta átomos mal estructurados, dependencias circulares, y oportunidades de optimización. Usar durante migración de Redux o para revisar arquitectura de estado.
---

# Jotai Audit

Auditoría de arquitectura de estado con Jotai.

## Proceso de Auditoría

### 1. Inventariar Átomos

```bash
# Buscar definiciones de átomos
grep -r "atom(" src/ --include="*.js" --include="*.ts"
```

### 2. Clasificar Átomos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| Primitivo | Estado base | `atom(null)` |
| Derivado | Computed | `atom((get) => ...)` |
| Async | Fetching | `atom(async (get) => ...)` |
| Write-only | Actions | `atom(null, (get, set) => ...)` |

### 3. Checklist de Auditoría

```markdown
## Jotai Audit Checklist

### Estructura
- [ ] Átomos organizados por dominio (user/, houses/, ui/)
- [ ] Nombres descriptivos (userAtom, selectedHouseIdAtom)
- [ ] Un archivo index.js con re-exports

### Composición
- [ ] Átomos pequeños y enfocados
- [ ] Derivados usan otros átomos (no duplican data)
- [ ] No hay átomos "god object" con todo el estado

### Performance
- [ ] useAtomValue para read-only
- [ ] useSetAtom para write-only
- [ ] Átomos derivados evitan recálculos innecesarios

### Coexistencia Redux (si aplica)
- [ ] Migración incremental documentada
- [ ] No hay duplicación de estado
- [ ] Plan para eliminar Redux
```

### 4. Anti-Patterns a Detectar

```javascript
// ❌ Átomo gigante
const appStateAtom = atom({
  user: {},
  houses: [],
  filters: {},
  ui: {},
});

// ❌ Dependencia circular
const aAtom = atom((get) => get(bAtom) + 1);
const bAtom = atom((get) => get(aAtom) + 1);

// ❌ Side effects en derivados
const badAtom = atom((get) => {
  localStorage.setItem('x', get(xAtom)); // ❌
  return get(xAtom);
});
```

## Output Esperado

```markdown
## Jotai Audit Report

### Inventario
- Átomos primitivos: X
- Átomos derivados: Y
- Átomos async: Z

### Issues
1. [CRÍTICO] `appStateAtom` es demasiado grande - dividir
2. [WARN] `filterAtom` no se usa - eliminar

### Recomendaciones
- Extraer user state a atoms/user.js
- Convertir selectedHouse a átomo derivado
```
