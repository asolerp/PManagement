# Estructura de Datos de Entradas en Firestore

## Resumen

Este documento describe cómo se registran las entradas y salidas de trabajadores en Firestore y cómo se estructura la información para su visualización.

## Estructura del Documento en Firestore

### Colección: `entrances`

Cada documento en la colección `entrances` tiene la siguiente estructura:

```javascript
{
  // ID del documento (generado automáticamente por Firestore)
  id: "auto-generated-id",

  // Acción realizada ('enter' para entrada, 'exit' para salida)
  action: "enter",

  // Información del trabajador (objeto completo del usuario)
  worker: {
    id: "worker-id",
    name: "Juan Pérez",
    firstName: "Juan",
    secondName: "Pérez",
    email: "juan.perez@example.com",
    role: "worker",
    profileImage: {
      small: "https://...",
      thumbnail: "https://..."
    }
  },

  // Fecha y hora de entrada (Timestamp de Firestore)
  date: Timestamp: Timestamp,
    nanoseconds: number
  },

  // Fecha y hora de salida (Timestamp de Firestore) - null si aún no ha salido
  exitDate: {
    seconds: Timestamp,
    nanoseconds: number
  } | null,

  // Ubicación GPS de entrada
  location: {
    latitude: number,
    longitude: number
  },

  // Ubicación GPS de salida - solo existe si hay exitDate
  exitLocation: {
    latitude: number,
    longitude: number
  },

  // Array de imágenes en formato: [{ url: "https://..." }, { url: "https://..." }]
  // - images[0] = foto de entrada
  // - images[1] = foto de salida (si existe)
  images: [
    {
      url: "https://firebasestorage.googleapis.com/..."
    },
    {
      url: "https://firebasestorage.googleapis.com/..."
    }
  ],

  // Casa asociada (opcional, puede no existir)
  house: {
    id: "house-id",
    houseName: "Casa Principal"
  } | undefined
}
```

## Flujo de Registro

### 1. Registro de Entrada (`saveEntrance`)

Cuando un trabajador registra su entrada:

1. **Se captura la foto** usando la cámara del dispositivo
2. **Se obtiene la ubicación GPS** actual
3. **Se crea el documento en Firestore** con:
   ```javascript
   {
     action: 'enter',
     worker: user, // Objeto completo del usuario autenticado
     location: {
       latitude: info.coords.latitude,
       longitude: info.coords.longitude
     },
     date: firebase.firestore.Timestamp.fromDate(new Date())
   }
   ```
4. **Se suben las imágenes** a Firebase Storage y se actualiza el documento con:
   ```javascript
   {
     images: firestore.FieldValue.arrayUnion({ url: 'https://...' });
   }
   ```

### 2. Registro de Salida (`updateEntrance`)

Cuando un trabajador registra su salida:

1. **Se captura la foto** usando la cámara del dispositivo
2. **Se obtiene la ubicación GPS** actual
3. **Se actualiza el documento existente** con:
   ```javascript
   {
     action: 'exit',
     exitDate: firebase.firestore.Timestamp.fromDate(new Date()),
     exitLocation: {
       latitude: info.coords.latitude,
       longitude: info.coords.longitude
     }
   }
   ```
4. **Se agrega la segunda imagen** al array:
   ```javascript
   {
     images: firestore.FieldValue.arrayUnion({ url: 'https://...' });
   }
   ```

## Código de Implementación

### Archivo: `src/Screens/ConfirmEntrance/hooks/useConfirmEntrance.js`

- `saveEntrance(imgs)`: Crea un nuevo documento de entrada
- `updateEntrance(imgs, docId)`: Actualiza un documento existente con la salida

### Archivo: `src/hooks/useUploadImage.js`

- `uploadImages(imgs, item, docId, callback)`: Maneja la subida de imágenes
- Para `entrances`, guarda las imágenes en formato `images: [{ url: '...' }]`

## Visualización

### Pantallas que consumen estos datos:

1. **TimeTrackingScreen**: Lista todas las entradas con filtros por fecha y trabajador
2. **EntranceDetailScreen**: Muestra detalles completos de una entrada específica
3. **EntrancesManager**: Gestión de entradas para el owner
4. **TimeTrackingCard**: Tarjeta individual de entrada en la lista

### Formato esperado por la visualización:

- **Estado**: Se determina por la existencia de `exitDate`

  - Si `exitDate` existe → "Finalizado" (verde)
  - Si `exitDate` es `null` → "En curso" (amarillo/warning)

- **Imágenes**: Se esperan en formato `images: [{ url: '...' }]`

  - `images[0]?.url` = Foto de entrada
  - `images[1]?.url` = Foto de salida (si existe)

- **Ubicaciones**:
  - `location` = Coordenadas de entrada (siempre existe)
  - `exitLocation` = Coordenadas de salida (solo si hay `exitDate`)

## Notas Importantes

1. **Campo `images` vs `photos`**:

   - El código actual guarda en `images` con formato `[{ url: '...' }]`
   - NO usar `photos` que es un array de strings `['url1', 'url2']`

2. **Campo `action`**:

   - Se guarda pero NO se usa para determinar el estado visual
   - El estado se determina por la existencia de `exitDate`

3. **Ubicación de imágenes**:

   - Las imágenes se guardan en Firebase Storage en: `/entrances/{docId}/Photos/{fileName}`
   - Las URLs se almacenan en el campo `images` del documento

4. **Trabajador**:

   - Se guarda el objeto completo del usuario (`worker: user`)
   - Debe incluir al menos: `id`, `name`, `firstName`, `secondName`, `email`, `profileImage`

5. **Casa (opcional)**:
   - El campo `house` es opcional y puede no existir
   - Si existe, debe tener al menos `id` y `houseName`

## Compatibilidad con Mock Data

El mock data en `useTimeTracking.js` sigue exactamente esta estructura, por lo que:

- ✅ Los datos reales de Firestore se visualizarán correctamente
- ✅ El filtrado funciona igual para datos reales y mock
- ✅ La visualización es consistente entre ambos
