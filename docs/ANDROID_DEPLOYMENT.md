# Despliegue Android

Guía para generar el build de Android y desplegarlo (equivalente al flujo que ya te funcionó en iOS).

---

## 1. Requisitos previos

- **Keystore** de release ya configurado (ver `SIGNING_SETUP.md`).
- Credenciales de Android en EAS (o variables de signing si builds locales).

---

## 2. Generar el build

### Opción A: EAS Build (recomendado)

Genera un **AAB** (Android App Bundle) listo para Play Store o para distribución directa:

```bash
# Build de producción (AAB)
eas build --profile production --platform android
```

Al terminar, EAS te da un enlace para **descargar el .aab**. Puedes usarlo para subirlo a Play Console o para distribución privada.

Si prefieres un **APK** (útil para instalar directo o para algunos MDM):

```bash
# Build perfil preview genera APK
eas build --profile preview --platform android
```

O añadir un perfil en `eas.json` que genere AAB pero sin submit (ya lo tienes con `production`).

### Opción B: Build local

Con keystore y variables de entorno:

```bash
export ANDROID_KEYSTORE_PASSWORD="tu_password"
export ANDROID_KEY_PASSWORD="tu_password"
npx expo run:android --variant release
```

El APK sale en `android/app/build/outputs/apk/release/`.

---

## 3. Cómo desplegar (elegir una vía)

### A) Google Play (recomendado si quieres algo parecido a “Custom App” en iOS)

Equivalente a tener la app “privada” para tu organización vía tienda gestionada:

1. **Crear la app en Google Play Console**  
   - [Play Console](https://play.google.com/console) → Crear aplicación.

2. **Subir el AAB**  
   - Release → Production (o Internal testing / Closed testing) → Crear nueva release → Subir el .aab descargado de EAS.

3. **Distribución para una organización (tipo “Custom App”):**
   - **Internal testing** o **Closed testing**: solo correos o lista de testers que tú defines.
   - **Managed Google Play (Android Enterprise)**: la organización (ej. PORT MANAGEMENT MALLORCA SL) enlaza su cuenta de Google con Managed Google Play y puede asignar tu app a sus dispositivos desde el panel de administración (similar a Apple Business Manager). Tu app puede estar en “Producción” pero solo visible/asignable por esas cuentas.

4. **Envío automático con EAS** (opcional):

   En `eas.json` ya tienes algo como:

   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-play-service-account.json",
         "track": "internal"
       }
     }
   }
   ```

   Necesitas el JSON de la **cuenta de servicio** de Play Console (API access) en `google-play-service-account.json`. Luego:

   ```bash
   eas submit --platform android --latest
   ```

   Eso sube el último build de EAS al track `internal`. Puedes cambiar `"track"` a `"alpha"`, `"beta"` o `"production"` según quieras.

---

### B) Distribución directa (sin Play Store)

Para instalar en dispositivos sin pasar por Play (MDM, enlace directo, etc.):

1. **Generar build:**
   - AAB: `eas build --profile production --platform android` (descargas el .aab).
   - APK: `eas build --profile preview --platform android` (descargas el .apk).

2. **Subir el AAB o APK** a un sitio HTTPS (tu servidor, MDM, etc.).

3. **Instalación:**
   - **MDM**: la mayoría de MDM (Intune, VMware, etc.) permiten “aplicación interna” o “line-of-business app”: subes el APK (o AAB si el MDM lo soporta) y lo asignas a grupos de dispositivos.
   - **Enlace directo**: compartes un enlace al APK; el usuario abre el enlace en el móvil y debe permitir “instalar desde orígenes desconocidos” (según versión de Android).

4. **Firmado:** El build de EAS ya va firmado con tu keystore; no hace falta firmar de nuevo para distribución directa.

---

## 4. Resumen rápido

| Objetivo                         | Comando / Acción |
|----------------------------------|------------------|
| Generar AAB para Play o almacenar | `eas build --profile production --platform android` |
| Generar APK para instalar directo | `eas build --profile preview --platform android` |
| Subir a Play (internal)          | Configurar `google-play-service-account.json` y `eas submit --platform android --latest` |
| Distribución solo organización   | Play: Internal/Closed testing o Managed Google Play; o distribución directa con AAB/APK + MDM |

Si indicas si quieres **solo Play Store** (y si internal/closed/producción) o **solo directo/MDM**, se puede detallar solo ese flujo paso a paso.
