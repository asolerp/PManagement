# Configuración de EAS Build y Submit

## Requisitos previos

1. Cuenta de Expo (crear en https://expo.dev)
2. EAS CLI instalado: `npm install -g eas-cli`
3. Cuenta de Apple Developer con acceso a App Store Connect

## Configuración inicial (una sola vez)

### 1. Login en EAS

```bash
eas login
```

### 2. Vincular proyecto con Expo

```bash
eas init
```

Esto actualizará `app.config.js` con tu `projectId`.

### 3. Configurar credenciales de iOS

```bash
eas credentials
```

Selecciona:
- Platform: iOS
- Selecciona tu app
- EAS puede gestionar automáticamente los certificados y profiles

### 4. Obtener el App Store Connect ID

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Selecciona tu app
3. En la URL verás algo como: `apps/123456789/appstore/ios/version/inflight`
4. El `123456789` es tu `ascAppId`

### 5. Actualizar eas.json

Reemplaza `CONFIGURAR_APP_STORE_CONNECT_ID` con tu ID real en `eas.json`.

---

## Flujos de Build

### Preview (Testing interno)

```bash
# Build para iOS (dispositivo físico)
npm run build:preview:ios

# Build para Android (APK)
npm run build:preview:android
```

### TestFlight

```bash
# Solo build (genera IPA)
npm run build:testflight

# Build + Submit a TestFlight (automatizado)
npm run release:testflight
```

### Production

```bash
# Build para ambas plataformas
npm run build:production

# Build + Submit a las tiendas
npm run release:production
```

---

## Updates OTA (Over-The-Air)

Para cambios de JavaScript sin rebuild nativo:

```bash
# Update para preview
npm run update:preview

# Update para producción
npm run update:production
```

**Nota**: Los updates OTA solo funcionan para cambios de JS/assets. Cambios nativos requieren nuevo build.

---

## Comandos útiles

```bash
# Ver estado de builds
eas build:list

# Ver builds en progreso
eas build:list --status=in_progress

# Descargar último build
eas build:download

# Cancelar build
eas build:cancel

# Ver submissions
eas submit:list
```

---

## Flujo recomendado para TestFlight

1. **Asegúrate de que todo funciona localmente**:
   ```bash
   npm start
   # Prueba en simulador/dispositivo
   ```

2. **Incrementa la versión** (si es necesario):
   - `app.config.js` → `version` y `buildNumber`/`versionCode`
   - EAS puede auto-incrementar con `autoIncrement: true`

3. **Ejecuta el release**:
   ```bash
   npm run release:testflight
   ```

4. **Espera** (el build tarda ~15-20 minutos)

5. **Verifica en App Store Connect** → TestFlight

---

## Troubleshooting

### Error de credenciales
```bash
eas credentials --platform ios
# Regenerar certificados si es necesario
```

### Error de provisioning profile
```bash
eas build --profile testflight --platform ios --clear-credentials
```

### Build falla en Expo servers
Revisa los logs en: https://expo.dev/accounts/[tu-usuario]/projects/[proyecto]/builds

---

## Comparación: EAS vs Fastlane (legacy)

| Aspecto | EAS | Fastlane |
|---------|-----|----------|
| Setup | Simple (CLI) | Complejo (Ruby, Gemfile) |
| Build | En la nube (Expo) | Local (tu Mac) |
| Tiempo | ~15-20 min | ~10-15 min |
| Credenciales | Gestionadas automáticamente | Manual con Match |
| Costo | Free tier disponible | Gratis |
| CI/CD | Integrado | Requiere config extra |

**Recomendación**: Usar EAS para simplicidad. El script legacy `testflight:legacy` sigue disponible si prefieres Fastlane.
