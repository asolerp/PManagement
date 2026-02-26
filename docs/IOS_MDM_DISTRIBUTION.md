# Distribución iOS por MDM (Device Management)

Apple te pide usar un **manifest** con un servicio de gestión de dispositivos (MDM). Este documento resume cómo obtener ese manifest y usarlo.

## No hay nada que marcar en Xcode

El manifest **no** es una opción en el proyecto. Se **genera al exportar** la app desde Xcode cuando eliges distribución "Custom" / "Enterprise". No hay que añadir ningún target ni plist especial en el repo.

---

## 1. Requisitos previos

- **Apple Developer Enterprise Program** (para apps in-house) **o** distribución **Custom Apps** vía Apple Business Manager (ABM).
- Perfil de aprovisionamiento de distribución Enterprise / in-house.
- .ipa firmado con ese perfil.

Si usas **EAS Build** con `enterpriseProvisioning: "universal"` (como en tu `SIGNING_SETUP.md`), EAS genera el .ipa; el **manifest** se crea después en Xcode (ver siguiente sección).

---

## 2. Cómo obtener el manifest (.plist)

El manifest es un **.plist** que indica la URL del .ipa y metadatos. Apple dice que **Xcode lo crea** cuando compartes el archivo para distribución a la organización.

### Opción A: Exportar desde Xcode (recomendado por Apple)

1. Abre el proyecto en Xcode: `open ios/PortManagement.xcworkspace`
2. **Product → Archive**
3. En el Organizer, selecciona el archive → **Distribute App**
4. Elige **Custom** o **Enterprise** (según tu programa)
5. En el asistente, cuando pida **URL del .ipa**, indica la URL HTTPS donde vas a alojar el .ipa (ej: `https://tudominio.com/apps/PortManagement.ipa`)
6. Xcode generará:
   - El .ipa (o te dirá que uses el que ya tienes)
   - Un **manifest .plist** con esa URL y los metadatos que el dispositivo necesita

Guarda ese .plist (ej: `manifest.plist`). Ese es el archivo que usarás en el MDM.

### Opción B: Si solo tienes el .ipa (p. ej. de EAS)

Si el .ipa lo generas con EAS y no pasas por “Distribute App” en Xcode, tienes que:

- O bien hacer un Archive en Xcode con ese mismo bundle/versión y seguir el flujo de arriba para que Xcode genere el manifest con la URL correcta del .ipa.
- O bien crear el manifest a mano (mismo formato que usa Xcode). Estructura típica:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>https://tudominio.com/apps/PortManagement.ipa</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>TU_BUNDLE_ID</string>
        <key>bundle-version</key>
        <string>1.0</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>Port Management</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
```

Sustituye `TU_BUNDLE_ID`, la URL del .ipa y título/versión por los de tu app. El MDM usará este .plist con **InstallApplication** o **InstallEnterpriseApplication**.

---

## 3. Usar el manifest en el MDM

Apple indica que uses el manifest con una de estas opciones:

| Método | Requisitos |
|--------|------------|
| **Declarative app management** | iOS 17.2+ / iPadOS 17.2+ / visionOS 1.1+ |
| **InstallEnterpriseApplication** | Manifest file o embedded manifest |
| **InstallApplication** | Manifest file |

En tu MDM (Jamf, Intune, Meraki, etc.):

1. **Sube el .ipa** a un sitio HTTPS (tu servidor o el del MDM).
2. **Manifest**: o bien subes el .plist generado en el paso 2, o indicas la **URL del manifest** (HTTPS).
3. En la consola del MDM, crea una acción/orden de instalación de app empresarial y:
   - **InstallEnterpriseApplication**: pasa la URL del manifest (o el manifest embebido según lo que permita tu MDM).
   - **InstallApplication**: pasa el manifest según la documentación del comando (normalmente URL del .plist).

El dispositivo descargará el manifest, luego el .ipa desde la URL que venga en el manifest, y lo instalará.

---

## 4. Resumen

- **No hay** ninguna opción en la config de Xcode que “active” distribución por MDM; eso se hace en App Store Connect / ABM y en el MDM.
- El **manifest** lo genera Xcode al exportar para Custom/Enterprise, o lo creas a mano con la estructura de arriba.
- Para usar un **device management service**, solo necesitas ese manifest (o su URL) y el .ipa en HTTPS, y luego usar **InstallEnterpriseApplication** o **InstallApplication** (o Declarative app management en iOS 17.2+).

Referencia: [Distribute proprietary in-house apps to Apple devices](https://support.apple.com/guide/deployment/distribute-proprietary-in-house-apps-depce7cefc4d/web).
