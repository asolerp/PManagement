# Migración: Renombrar colecciones Firestore (proyecto viejo)

Este script copia los datos del proyecto **port-management-9bd53** de las colecciones antiguas a las nuevas, para que la app siga funcionando tras el renombrado.

**Importante:** Las rules desplegadas en el proyecto viejo ya solo permiten las colecciones nuevas (`properties`, `incidents`, `timeEntries`, `checkTemplates`). Hasta que ejecutes este script, la app no verá datos en el proyecto viejo. Ejecuta la migración lo antes posible.

## Orden de ejecución

### 1. Cambiar al proyecto viejo

```bash
cd /path/to/PropertyManager
firebase use default
```

### 2. ~~Desplegar rules e indexes~~ (ya hecho)

Las rules e indexes con los nombres nuevos ya están desplegadas en el proyecto viejo.

### 3. Ejecutar la migración

Necesitas una clave de cuenta de servicio del proyecto **port-management-9bd53** (Firebase Console → Project settings → Service accounts → Generate new private key).

```bash
cd functions
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/key-port-management-9bd53.json node migrations/renameCollections.js
```

Esto **copia** los documentos (y subcolecciones) a las nuevas colecciones. Las antiguas se mantienen.

### 4. Comprobar datos

Revisa en la consola de Firestore que `properties`, `incidents`, `timeEntries` y `checkTemplates` tienen los datos esperados.

### 5. (Opcional) Borrar colecciones antiguas

Si todo está correcto:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/key.json node migrations/renameCollections.js --delete-old
```

### 6. Desplegar Cloud Functions en el proyecto viejo

Para que las functions del proyecto viejo usen las nuevas colecciones:

```bash
firebase use default
firebase deploy --only functions
```

---

**Resumen:** El código ya usa los nombres nuevos. Solo falta copiar los datos en el proyecto viejo, opcionalmente borrar los antiguos, y redesplegar functions.
