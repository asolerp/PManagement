---
name: rq-cache-audit
description: Audita la configuración de cache de React Query - staleTime, gcTime, invalidaciones. Usar para optimizar performance de fetching o diagnosticar datos desactualizados.
---

# React Query Cache Audit

Auditoría de estrategia de caching.

## Proceso de Auditoría

### 1. Revisar Configuración Global

```javascript
// Buscar QueryClient config
// Típicamente en App.js o providers/
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ???,  // Tiempo antes de refetch
      gcTime: ???,     // Tiempo en cache (antes: cacheTime)
      retry: ???,
    },
  },
});
```

### 2. Inventariar Queries

```bash
# Buscar useQuery
grep -r "useQuery" src/ --include="*.js" -A 5
```

### 3. Checklist de Auditoría

```markdown
## RQ Cache Audit Checklist

### Configuración
- [ ] staleTime razonable (no 0 para todo)
- [ ] gcTime >= staleTime
- [ ] retry configurado por tipo de query

### Query Keys
- [ ] Keys estructuradas y consistentes
- [ ] Factory pattern para keys complejas
- [ ] No hay keys hardcodeadas dispersas

### Invalidación
- [ ] Mutations invalidan queries correctas
- [ ] No hay over-invalidation (invalidar todo)
- [ ] Optimistic updates donde corresponde

### Performance
- [ ] Prefetch en navegación crítica
- [ ] enabled para queries condicionales
- [ ] select para transformar data
```

### 4. Matriz de Cache

| Query | staleTime | gcTime | Razón |
|-------|-----------|--------|-------|
| user profile | 5min | 10min | Cambia poco |
| houses list | 1min | 5min | Updates frecuentes |
| notifications | 30s | 2min | Tiempo real importante |
| static config | Infinity | Infinity | Nunca cambia |

### 5. Problemas Comunes

```javascript
// ❌ staleTime: 0 (refetch siempre)
useQuery({ queryKey: ['data'], queryFn: fetch, staleTime: 0 });

// ❌ Invalidar todo
queryClient.invalidateQueries(); // Sin filtro

// ❌ Keys inconsistentes
['houses', id] vs ['house', id] vs ['getHouse', id]
```

## Output Esperado

```markdown
## React Query Cache Audit

### Configuración Global
- staleTime: Xms
- gcTime: Yms
- retry: Z

### Queries Analizadas
| Query | Config | Issue |
|-------|--------|-------|
| houses | staleTime: 0 | ⚠️ Refetch excesivo |
| user | OK | ✅ |

### Recomendaciones
1. Aumentar staleTime de houses a 60s
2. Implementar query key factory
3. Añadir prefetch en HomeScreen
```
