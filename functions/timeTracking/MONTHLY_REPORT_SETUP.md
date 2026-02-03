# 📅 Configuración del Reporte Mensual Automático

Este documento explica cómo configurar y probar el envío automático del reporte mensual de jornada laboral.

## 🎯 ¿Qué hace?

El sistema envía **automáticamente** un reporte completo de jornada laboral el **primer día de cada mes a las 9:00 AM** con los datos del mes anterior.

### Incluye:

- ✅ Archivo Excel con todos los registros
- ✅ Resumen de horas por trabajador
- ✅ Estadísticas generales (total, completos, pendientes)
- ✅ Alertas si hay registros pendientes
- ✅ Enlace de descarga válido por 1 hora

---

## 🔧 Configuración

### Opción 1: Variables de Entorno (Recomendado)

1. **Configurar emails destinatarios:**

```bash
cd functions
firebase functions:config:set monthly_report.recipients="email1@example.com,email2@example.com,email3@example.com"
```

2. **Configurar credenciales de email (si no están configuradas):**

```bash
firebase functions:config:set email.user="tu-email@gmail.com"
firebase functions:config:set email.password="tu-contraseña-de-aplicación"
```

3. **Ver configuración actual:**

```bash
firebase functions:config:get
```

4. **Descargar configuración para desarrollo local:**

```bash
firebase functions:config:get > .runtimeconfig.json
```

---

### Opción 2: Firestore (Alternativa)

Si prefieres gestionar los destinatarios desde Firestore:

1. Ve a Firestore Console
2. Crea una colección `settings`
3. Crea un documento `timeTracking`
4. Agrega el campo:

```javascript
{
  "monthlyReportRecipients": [
    "email1@example.com",
    "email2@example.com"
  ]
}
```

---

## 🚀 Despliegue

### 1. Instalar dependencias (si es necesario)

```bash
cd functions
npm install
```

### 2. Desplegar las funciones

```bash
# Desplegar todas las funciones
firebase deploy --only functions

# O solo las funciones de time tracking
firebase deploy --only functions:scheduledMonthlyReport,functions:testMonthlyReport
```

---

## 🧪 Cómo Probar

### Método 1: Función de Prueba HTTP

La forma más fácil de probar:

```bash
# 1. Obtener tu token de autenticación
gcloud auth print-identity-token

# 2. Llamar a la función de prueba
curl -X POST https://europe-west1-TU_PROJECT_ID.cloudfunctions.net/testMonthlyReport \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

O desde el navegador (si tienes permisos):

```
https://europe-west1-TU_PROJECT_ID.cloudfunctions.net/testMonthlyReport
```

---

### Método 2: Firebase Functions Shell (Desarrollo Local)

```bash
cd functions

# 1. Iniciar shell
npm run shell

# 2. En el shell, ejecutar:
testMonthlyReport()

# O probar la función programada directamente:
scheduledMonthlyReport()
```

---

### Método 3: Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Functions**
4. Busca `testMonthlyReport`
5. Click en los 3 puntos → **Test function**
6. Click en **Run function**

---

### Método 4: Cambiar Temporalmente el Schedule (Para Testing)

Puedes cambiar el schedule a cada minuto para probar:

```javascript
// En scheduledMonthlyReport.js, línea 13:
.pubsub.schedule('* * * * *') // Cada minuto (SOLO PARA TESTING)
```

⚠️ **IMPORTANTE:** Recuerda volver a ponerlo a `'0 9 1 * *'` después de probar.

---

## 📧 Configurar Gmail App Password

Si usas Gmail, necesitas una contraseña de aplicación:

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. **Seguridad** → **Verificación en 2 pasos** (actívala si no la tienes)
3. **Contraseñas de aplicaciones**
4. Selecciona **Correo** y **Otro** (nombre personalizado: "Firebase Functions")
5. Copia la contraseña generada (16 caracteres)
6. Configúrala:

```bash
firebase functions:config:set email.password="xxxx xxxx xxxx xxxx"
```

---

## 🔍 Verificar que Funciona

### 1. Ver Logs en Tiempo Real

```bash
firebase functions:log --only scheduledMonthlyReport
```

### 2. Ver Logs en Console

1. [Firebase Console](https://console.firebase.google.com/)
2. **Functions** → Click en `scheduledMonthlyReport`
3. Tab **Logs**

### 3. Buscar en los logs:

- ✅ `Starting scheduled monthly time tracking report...`
- ✅ `Report period: ...`
- ✅ `Sending report to: ...`
- ✅ `Excel generated: ...`
- ✅ `Monthly report sent successfully`

---

## 📅 Schedule Format

El formato del schedule es **cron**:

```
┌─────── minuto (0 - 59)
│ ┌───── hora (0 - 23)
│ │ ┌─── día del mes (1 - 31)
│ │ │ ┌─ mes (1 - 12)
│ │ │ │ ┌ día de la semana (0 - 6, 0 = domingo)
│ │ │ │ │
* * * * *
```

**Ejemplos:**

- `0 9 1 * *` - Día 1 de cada mes a las 9:00 AM (CONFIGURACIÓN ACTUAL)
- `0 9 * * 1` - Cada lunes a las 9:00 AM
- `0 0 1,15 * *` - Día 1 y 15 de cada mes a medianoche
- `0 9 L * *` - Último día de cada mes a las 9:00 AM

---

## 🐛 Troubleshooting

### Error: "No recipients configured"

**Solución:** Configura los destinatarios con una de las opciones de arriba.

```bash
firebase functions:config:set monthly_report.recipients="tu-email@example.com"
firebase deploy --only functions:scheduledMonthlyReport
```

---

### Error: "Failed to authenticate"

**Solución:** Verifica las credenciales de email:

```bash
firebase functions:config:get email
```

Si están vacías:

```bash
firebase functions:config:set email.user="tu-email@gmail.com"
firebase functions:config:set email.password="tu-app-password"
```

---

### Error: "No records found"

Esto es normal si no hay registros en el período. El email se enviará indicando 0 registros.

---

### La función no se ejecuta automáticamente

1. **Verifica que esté desplegada:**

```bash
firebase functions:list | grep scheduledMonthlyReport
```

2. **Verifica los logs:**

```bash
firebase functions:log --only scheduledMonthlyReport --limit 50
```

3. **El schedule solo funciona en producción** (no en emulador local)

---

## 💰 Costos

- **Cloud Scheduler:** ~$0.10/mes (incluye 3 jobs gratis)
- **Cloud Functions:** Según uso (generalmente < $1/mes para 1 ejecución mensual)
- **Storage:** Temporal (archivos se eliminan después de 1 hora)

---

## 🔒 Seguridad

- ✅ Requiere autenticación de sistema
- ✅ Los enlaces de descarga expiran en 1 hora
- ✅ Las credenciales de email están en variables de entorno
- ✅ Los logs no muestran información sensible

---

## 📝 Notas Adicionales

1. **Zona horaria:** Configurada a `Europe/Madrid`
2. **Timeout:** 9 minutos (suficiente para reportes grandes)
3. **Memoria:** 1GB (suficiente para procesar miles de registros)
4. **Período:** Siempre el mes anterior completo
5. **Reintentos:** Si falla, NO se reintenta (espera al siguiente mes)

---

## ✅ Checklist de Implementación

- [ ] Configurar emails destinatarios
- [ ] Configurar credenciales de Gmail
- [ ] Desplegar funciones
- [ ] Probar con `testMonthlyReport`
- [ ] Verificar que el email llegue correctamente
- [ ] Verificar que el Excel se genere y descargue
- [ ] Revisar los logs para confirmar éxito
- [ ] Documentar cualquier configuración adicional específica de tu proyecto

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `firebase functions:log --only scheduledMonthlyReport`
2. Prueba la función manual: `testMonthlyReport`
3. Verifica la configuración: `firebase functions:config:get`
4. Revisa que el email y contraseña sean correctos

---

**¡Listo! El sistema enviará automáticamente el reporte el primer día de cada mes a las 9:00 AM. 🎉**
