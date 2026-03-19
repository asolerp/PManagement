# Seed Andratx (Mallorca): 10 casas + 5 limpiadoras

Script para tener un flujo más real: **10 propiedades** en la zona de Andratx (Mallorca) con dirección y coordenadas, y **5 limpiadoras** (trabajadoras solo en Firestore, sin Auth).

Sirve para probar en el dashboard:

- **Cuadrante** → Proponer combinación óptima (seleccionar estas casas y limpiadoras)
- **Optimizar ruta** (las casas tienen `location` para el algoritmo de proximidad)
- Asignación y cuadrante del día con datos creíbles

## Requisitos

- Mismo setup que el seed del dashboard: **admin@admin.es** con `companyId` en `users`, o pasar `companyId` por argumento.
- Cuenta de servicio: `GOOGLE_APPLICATION_CREDENTIALS` apuntando a la key JSON.

## Uso

```bash
cd functions
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu-key.json node migrations/seedAndratxMallorca.js
```

Con companyId concreto:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu-key.json node migrations/seedAndratxMallorca.js <companyId>
```

## Qué crea

- **10 propiedades** en `properties`: nombres tipo "Villa Sallent", "Casa les Escoles", etc., con `address` en Andratx/Port d'Andratx/Camp de Mar/S'Arracó y `location: { latitude, longitude }` para rutas.
- **5 usuarios** en `users` con `role: 'worker'` (limpiadoras): María García, Carmen López, Isabel Martínez, Rosa Sánchez, Ana Fernández. Cada una tiene **domicilio en Palma o Calvià** (`homeAddress` y `homeLocation` con coordenadas) para que "Optimizar ruta" use su punto de partida. Email tipo `limpiadora-andratx-XXXXXX-1@demo.local`. Solo documento Firestore, sin cuenta en Auth.

El script **no duplica**: si ya existe una casa con ese `houseName` o una trabajadora con ese email, no la vuelve a crear.

## Después del seed

1. En el **dashboard** → **Cuadrante** → elegir fecha → **Proponer combinación óptima**.
2. Marcar las 10 casas de Andratx y las 5 limpiadoras, ajustar minutos por casa si quieres.
3. **Generar propuesta** → revisar asignación → **Crear cuadrante con esta propuesta**.
4. En cada trabajador, **Optimizar ruta** para reordenar por proximidad (usa coordenadas de las casas).
