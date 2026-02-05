# 🔧 INSTRUCCIONES: Reparar Contadores Negativos

## Opción 2: Ejecutar desde Consola

### ✅ Método 1: Chrome DevTools / React Native Debugger

1. **Abrir la app en modo debug**

   ```bash
   npx expo start
   # Presiona 'j' para abrir debugger
   ```

2. **Abrir Chrome DevTools**

   - Chrome: `chrome://inspect`
   - O React Native Debugger si lo tienes instalado

3. **En la consola, pegar este código:**

```javascript
// Importar firestore
const firestore = require('@react-native-firebase/firestore').default;

// Función de reparación
async function repairNow() {
  console.log('🔧 Iniciando reparación...\n');

  const checklistsSnapshot = await firestore().collection('checklists').get();

  let repairedCount = 0;
  const batch = firestore().batch();

  for (const checklistDoc of checklistsSnapshot.docs) {
    const checklistData = checklistDoc.data();
    const checklistId = checklistDoc.id;

    const checksSnapshot = await firestore()
      .collection('checklists')
      .doc(checklistId)
      .collection('checks')
      .get();

    const actualDoneCount = checksSnapshot.docs.filter(
      doc => doc.data().done === true
    ).length;

    const currentDoneCount = checklistData.done || 0;

    if (currentDoneCount < 0 || currentDoneCount !== actualDoneCount) {
      const houseName = checklistData.house?.[0]?.houseName || 'Sin nombre';
      console.log(`🔧 ${houseName}: ${currentDoneCount} → ${actualDoneCount}`);
      batch.update(checklistDoc.ref, { done: actualDoneCount });
      repairedCount++;
    }
  }

  if (repairedCount > 0) {
    await batch.commit();
    console.log(
      `\n✅ Reparados: ${repairedCount} de ${checklistsSnapshot.docs.length}`
    );
  } else {
    console.log('\n✅ Todos correctos!');
  }
}

// Ejecutar
repairNow();
```

---

### ✅ Método 2: Agregar temporalmente en App.js

**Paso 1:** Agregar al inicio de `src/App.js`:

```javascript
// Importar al inicio del archivo
import repairNow from './utils/quickRepair';

// Dentro del componente App, agregar:
useEffect(() => {
  // Descomentar esta línea para ejecutar la reparación
  // repairNow();
}, []);
```

**Paso 2:** Descomentar la línea `repairNow()`

**Paso 3:** Recargar la app (Cmd+R o Ctrl+R)

**Paso 4:** Ver logs en terminal

**Paso 5:** Comentar de nuevo la línea

---

### ✅ Método 3: Expo CLI (Más Simple)

1. **Agregar al final de `src/App.js`:**

```javascript
// Al final del archivo, antes del export
if (__DEV__) {
  // Ejecutar 5 segundos después de que cargue la app
  setTimeout(() => {
    import('./utils/quickRepair').then(module => {
      console.log('🔧 Ejecutando reparación automática...');
      module.repairNow();
    });
  }, 5000);
}
```

2. **Recargar la app**

3. **Esperar 5 segundos**

4. **Ver logs en terminal**

5. **Remover el código después**

---

### ✅ Método 4: Script de Node.js (Más Avanzado)

**Crear archivo:** `scripts/repair.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function repair() {
  const checklistsSnapshot = await db.collection('checklists').get();
  const batch = db.batch();
  let count = 0;

  for (const doc of checklistsSnapshot.docs) {
    const data = doc.data();
    const checksSnapshot = await db
      .collection('checklists')
      .doc(doc.id)
      .collection('checks')
      .get();

    const actual = checksSnapshot.docs.filter(d => d.data().done).length;
    const current = data.done || 0;

    if (current < 0 || current !== actual) {
      console.log(`Reparando: ${doc.id} (${current} → ${actual})`);
      batch.update(doc.ref, { done: actual });
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Reparados: ${count}`);
  }
}

repair();
```

**Ejecutar:**

```bash
node scripts/repair.js
```

---

## 📊 Output Esperado

```
🔧 Iniciando reparación de contadores...

🔧 Reparando: Albercuix
   ID: rmhQhgoFQ8xmR1vLaQO8
   Contador: -20 → 0

✅ REPARACIÓN COMPLETADA

📊 Resumen:
   Total checklists: 150
   Reparados: 1
   Porcentaje: 0.7%

📋 Detalles de reparaciones:
   • Albercuix: -20 → 0
```

---

## ⚠️ IMPORTANTE

1. **Backup**: Los datos se sobrescriben, pero son correctos
2. **Testing**: Prueba en desarrollo primero
3. **Una vez**: Solo necesitas ejecutarlo una vez
4. **Remover código**: Después de reparar, elimina el código temporal

---

## 🎯 Recomendación

**Usa Método 3** (setTimeout en App.js) si no tienes experiencia con debuggers.

Es el más simple y funciona automáticamente.
