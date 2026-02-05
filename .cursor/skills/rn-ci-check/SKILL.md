---
name: rn-ci-check
description: Ejecuta checks de CI para React Native - lint, typecheck, tests. Usar cuando el usuario pida verificar calidad del código, antes de commit, o al preparar PR.
---

# RN CI Check

Ejecuta la suite completa de verificación de calidad.

## Comandos

```bash
# 1. Lint
npm run lint

# 2. TypeScript (si aplica)
npx tsc --noEmit

# 3. Tests
npm test

# 4. Build check (opcional, más lento)
npx expo prebuild --clean --no-install
```

## Workflow

1. Ejecutar lint primero (más rápido, errores comunes)
2. Si lint pasa, ejecutar tests
3. Reportar resultados con formato:

```
## CI Check Results

| Check | Status | Details |
|-------|--------|---------|
| Lint | ✅/❌ | N warnings, M errors |
| Tests | ✅/❌ | X passed, Y failed |
| Build | ✅/❌ | Notes |
```

## Fix Automático

```bash
# Auto-fix lint errors
npm run lint -- --fix

# Format con Prettier
npx prettier --write "src/**/*.{js,jsx,ts,tsx}"
```

## Errores Comunes

- **Import order**: Ejecutar `eslint --fix`
- **Unused vars**: Revisar si es intencional, prefixar con `_` si es necesario
- **Missing deps en hooks**: Añadir al array o usar `// eslint-disable-next-line`
