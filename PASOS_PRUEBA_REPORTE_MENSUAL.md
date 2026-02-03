# ⚡ Pasos Rápidos para Probar el Reporte Mensual

## 🎯 Objetivo

Enviar automáticamente **dos reportes Excel** de jornada laboral cada mes:

1. **📅 Mensual Detallado** - Por trabajador, día a día con primera entrada y última salida
2. **📊 Anual Acumulado** - Resumen por meses con totales anuales por trabajador

---

## 📋 PASOS PARA CONFIGURAR Y PROBAR

### 1️⃣ Configurar Emails Destinatarios

```bash
cd functions
firebase functions:config:set monthly_report.recipients="tu-email@example.com,otro-email@example.com"
```

**Cambia los emails** por los reales donde quieres recibir el reporte.

---

### 2️⃣ Configurar Gmail (si no lo has hecho)

#### Opción A: Ya tienes EMAIL_USER y EMAIL_PASSWORD

✅ Si ya funcionan otros emails en tu app, salta este paso.

#### Opción B: Configurar desde cero

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. **Seguridad** → Activa **Verificación en 2 pasos**
3. **Contraseñas de aplicaciones** → Crear nueva → Copiar contraseña
4. Ejecuta:

```bash
firebase functions:config:set email.user="tu-email@gmail.com"
firebase functions:config:set email.password="xxxx xxxx xxxx xxxx"
```

---

### 3️⃣ Descargar Configuración para Local (Opcional)

Si quieres probar localmente:

```bash
cd functions
firebase functions:config:get > .runtimeconfig.json
```

---

### 4️⃣ Desplegar las Funciones

```bash
# Desde la raíz del proyecto
firebase deploy --only functions:scheduledMonthlyReport,functions:testMonthlyReport
```

⏱️ Espera 2-3 minutos mientras se despliegan.

---

### 5️⃣ Probar AHORA (Sin Esperar al Mes)

#### 🔥 Método Más Fácil: Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. **Functions** (menú lateral)
4. Busca `testMonthlyReport`
5. Click en los **3 puntos** → **"Test function"**
6. Click **"Run function"**
7. ¡Deberías recibir el email en 1-2 minutos!

---

#### Método Alternativo: Shell Local

```bash
cd functions
npm run shell

# En el shell que se abre:
testMonthlyReport()
```

---

### 6️⃣ Verificar que Funcionó

✅ **Revisa tu email** - Deberías recibir un email con:

- Asunto: "📅 Registro de Jornada Laboral - [mes anterior]"
- Resumen de horas por trabajador
- **Dos botones de descarga:**
  - 📅 Informe Mensual Detallado
  - 📊 Informe Anual Acumulado

✅ **Ver logs** (opcional):

```bash
firebase functions:log --only testMonthlyReport --limit 20
```

Busca líneas como:

- ✅ `Testing monthly report...`
- ✅ `Report period: ...`
- ✅ `Monthly report sent successfully`

---

## 🎉 ¡Listo!

Si recibiste el email, ¡funciona perfecto!

La función programada se ejecutará **automáticamente cada día 1 del mes a las 9:00 AM** con los datos del mes anterior.

---

## 🔧 Troubleshooting Rápido

### ❌ "No recipients configured"

```bash
firebase functions:config:set monthly_report.recipients="tu-email@example.com"
firebase deploy --only functions:scheduledMonthlyReport
```

### ❌ "Authentication failed" en Gmail

1. Verifica que la verificación en 2 pasos esté activa
2. Genera una nueva contraseña de aplicación
3. Actualiza: `firebase functions:config:set email.password="nueva-contraseña"`

### ❌ No llega el email

1. Revisa spam/correo no deseado
2. Verifica que los emails estén bien escritos
3. Ver logs: `firebase functions:log --only testMonthlyReport`

### ❌ "No records found"

Esto es normal si no tienes registros. El email se envía igual indicando 0 registros.

---

## 📅 Cambiar el Schedule (Opcional)

El schedule actual: **Día 1 de cada mes a las 9:00 AM**

Para cambiar, edita `functions/timeTracking/scheduledMonthlyReport.js` línea 18:

```javascript
// Ejemplos:
.pubsub.schedule('0 9 1 * *')   // Día 1 a las 9:00 AM (ACTUAL)
.pubsub.schedule('0 8 1 * *')   // Día 1 a las 8:00 AM
.pubsub.schedule('0 9 * * 1')   // Cada lunes a las 9:00 AM
.pubsub.schedule('0 0 1,15 * *')// Día 1 y 15 a medianoche
```

Luego redespliega:

```bash
firebase deploy --only functions:scheduledMonthlyReport
```

---

## 📑 Contenido de los Excel

### 📅 **Informe Mensual Detallado**

Un archivo Excel con una pestaña por trabajador que incluye:

| Fecha      | Día Semana | Hora Entrada | Hora Salida    | Total Horas  | Propiedad |
| ---------- | ---------- | ------------ | -------------- | ------------ | --------- |
| 01/11/2025 | Viernes    | 08:00        | 17:30          | 9h 30m       | Casa A    |
| 02/11/2025 | Sábado     | 09:00        | 14:00          | 5h 0m        | Casa B    |
| ...        | ...        | ...          | ...            | ...          | ...       |
|            |            |              | **TOTAL MES:** | **180h 45m** |           |

**Características:**

- ✅ Si hay múltiples registros el mismo día: toma **primera entrada** y **última salida**
- ✅ Resalta fines de semana en color diferente
- ✅ Total acumulado mensual por trabajador
- ✅ Información de la propiedad/casa

---

### 📊 **Informe Anual Acumulado**

Un archivo Excel consolidado con vista anual:

| Trabajador   | Enero | Febrero | Marzo | ... | Diciembre | TOTAL ANUAL |
| ------------ | ----- | ------- | ----- | --- | --------- | ----------- |
| Juan Pérez   | 180h  | 175h    | 185h  | ... | 190h      | 2100h       |
| María García | 160h  | 165h    | 170h  | ... | 175h      | 1950h       |

**Características:**

- ✅ Vista comparativa mensual
- ✅ Total anual por trabajador
- ✅ Fácil identificación de tendencias
- ✅ Ideal para informes ejecutivos

---

## 📄 Documentación Completa

Para más detalles, ver: `functions/timeTracking/MONTHLY_REPORT_SETUP.md`

---

**🎊 ¡Todo configurado! El sistema enviará automáticamente ambos reportes cada mes.**
