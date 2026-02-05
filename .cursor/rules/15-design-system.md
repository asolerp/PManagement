# Design System - PortManagement

## Colores

**SIEMPRE** usar colores de `Theme/Variables.js`. **NUNCA** hardcodear colores.

```javascript
import { Colors } from '../../Theme/Variables';

// ✅ Correcto
color: Colors.pm
backgroundColor: Colors.gray100

// ❌ Incorrecto
color: '#55A5AD'
backgroundColor: '#F3F4F6'
```

### Paleta principal

| Token | Valor | Uso |
|-------|-------|-----|
| `Colors.pm` | `#55A5AD` | Color principal de marca |
| `Colors.white` | `#FFFFFF` | Fondos, texto sobre oscuro |
| `Colors.gray50-900` | Escala | Fondos, bordes, texto |
| `Colors.success` | `#10B981` | Estados exitosos |
| `Colors.warning` | `#F59E0B` | Advertencias |
| `Colors.danger` | `#EF4444` | Errores, eliminar |
| `Colors.info` | `#3B82F6` | Información |

### Grises más usados

- `Colors.gray50` - Fondo muy claro
- `Colors.gray100` - Fondo de cards
- `Colors.gray200` - Bordes
- `Colors.gray400` - Placeholder
- `Colors.gray500` - Texto secundario
- `Colors.gray700` - Texto principal
- `Colors.gray900` - Títulos

## Tipografía

```javascript
import { FontSize, FontWeight } from '../../Theme/Variables';

// Tamaños
FontSize.xs    // 12 - Caption
FontSize.sm    // 13 - Small text
FontSize.base  // 14 - Body
FontSize.md    // 15 - Body medium
FontSize.lg    // 16 - Subtitle
FontSize.xl    // 18 - Title small
FontSize['2xl'] // 20 - Title
FontSize['3xl'] // 24 - Header
FontSize['4xl'] // 30 - Big header

// Pesos
FontWeight.normal   // '400'
FontWeight.medium   // '500'
FontWeight.semibold // '600'
FontWeight.bold     // '700'
```

## Espaciado

```javascript
import { Spacing } from '../../Theme/Variables';

Spacing.xs   // 4
Spacing.sm   // 8
Spacing.md   // 12
Spacing.base // 16
Spacing.lg   // 20
Spacing.xl   // 24
Spacing['2xl'] // 32
```

## Bordes

```javascript
import { BorderRadius } from '../../Theme/Variables';

BorderRadius.sm   // 6
BorderRadius.md   // 8
BorderRadius.lg   // 12
BorderRadius.xl   // 16
BorderRadius['2xl'] // 20
BorderRadius.full // 9999 (círculo)
```

## Sombras

```javascript
import { Shadows } from '../../Theme/Variables';

// Aplicar spread
style={[styles.card, Shadows.md]}
```

## Componentes comunes

### PageLayout
Siempre usar como contenedor principal de pantallas:
```jsx
<PageLayout safe backButton footer={<CustomButton />}>
  {/* contenido */}
</PageLayout>
```

### CustomButton
```jsx
// Variantes disponibles
<CustomButton title="Guardar" variant="primary" />
<CustomButton title="Cancelar" variant="secondary" />
<CustomButton title="Eliminar" variant="danger" />
<CustomButton title="Más info" variant="outline" />
```

### ScreenHeader
```jsx
<ScreenHeader title="Título" subtitle="Descripción opcional" />
```

## Patrones de estilos

### Cards
```javascript
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  }
});
```

### Inputs
```javascript
const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    color: Colors.gray900,
    fontSize: FontSize.base,
    padding: Spacing.md,
  }
});
```

### Badges
```javascript
const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.pmLow,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    color: Colors.pm,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  }
});
```

## Migrando código existente

Al encontrar colores hardcodeados:

1. Identificar el color más cercano en `Colors`
2. Reemplazar el valor hardcodeado
3. Si el color no existe, **añadirlo a Variables.js** antes de usar

```javascript
// Antes
color: '#6B7280'

// Después
color: Colors.gray500
```
