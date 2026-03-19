# Permiso IAM para createCustomToken (registerCompany)

Si al registrar una empresa ves:

```text
Permission 'iam.serviceAccounts.signBlob' denied on resource
```

es porque la cuenta de servicio que ejecuta la Cloud Function (2.ª gen) no tiene permiso para firmar custom tokens. En 2.ª gen la función corre con la **cuenta por defecto de Compute Engine** y esa cuenta debe poder firmar (signBlob) como ella misma.

## Solución en Google Cloud Console

### Opción A: Conceder Token Creator a la cuenta por defecto de Compute (recomendada)

1. Abre **[Cuentas de servicio](https://console.cloud.google.com/iam-admin/serviceaccounts)** en el proyecto **property-manager-7d39a** (o el tuyo SaaS).
2. Localiza la **cuenta por defecto de Compute Engine** (nombre tipo “Compute Engine default service account”, email `{NÚMERO_PROYECTO}-compute@developer.gserviceaccount.com`).
3. Haz clic en el email de esa cuenta para abrir su detalle.
4. Pestaña **Permisos** → **Conceder acceso**.
5. En “Nuevos principales” pon **el mismo email** de la cuenta (ej. `123456789-compute@developer.gserviceaccount.com`).
6. En “Seleccionar un rol” busca **Service Account Token Creator** y selecciónalo.
7. **Guardar**.

Así la cuenta que ejecuta la función puede firmar custom tokens (signBlob) como ella misma.

### Opción B: Si la función usa la cuenta de Firebase Admin SDK

Si en tu proyecto el SDK firma con la cuenta de Firebase Admin (`firebase-adminsdk-xxxxx@...`):

1. En **Cuentas de servicio**, abre la cuenta **Firebase Admin SDK**.
2. **Permisos** → **Conceder acceso**.
3. Principal: el email de la **cuenta por defecto de Compute Engine** (la que ejecuta la función).
4. Rol: **Service Account Token Creator**.
5. **Guardar**.

## Referencia

- [Firebase: Create custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens) (sección “Service account does not have required permissions”).
- Cloud Functions 2.ª gen usan la cuenta por defecto de Compute Engine; esa cuenta debe tener permiso para firmar (signBlob) para que `admin.auth().createCustomToken()` funcione.
