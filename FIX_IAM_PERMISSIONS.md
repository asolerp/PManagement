# 🔧 Solución: Error de Permisos IAM

## Error:

```
Permission 'iam.serviceAccounts.signBlob' denied on resource
```

## Solución:

### Opción 1: Desde Google Cloud Console (Recomendado)

1. **Ve a Google Cloud Console:**

   ```
   https://console.cloud.google.com/iam-admin/iam?project=port-management-9bd53
   ```

2. **Busca la cuenta de servicio de Cloud Functions:**

   - Busca: `355954173896-compute@developer.gserviceaccount.com`
   - O busca: `*-compute@developer.gserviceaccount.com`

3. **Haz clic en el ícono de editar (lápiz) al lado de la cuenta**

4. **Agrega el rol:**
   - Click en "AGREGAR OTRO ROL"
   - Busca y selecciona: **"Service Account Token Creator"**
   - Click en "GUARDAR"

### Opción 2: Desde la línea de comandos (si tienes permisos)

```bash
# Otorgar el rol Service Account Token Creator
gcloud projects add-iam-policy-binding port-management-9bd53 \
  --member="serviceAccount:355954173896-compute@developer.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

### Opción 3: Verificar y otorgar permisos a la cuenta de servicio de Firebase

También puedes necesitar otorgar permisos a la cuenta de servicio de Firebase:

```bash
# Buscar la cuenta de servicio de Firebase
gcloud iam service-accounts list --project=port-management-9bd53

# Otorgar permisos (reemplaza con el email real de la cuenta)
gcloud projects add-iam-policy-binding port-management-9bd53 \
  --member="serviceAccount:firebase-adminsdk-XXXXX@port-management-9bd53.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

## Después de otorgar los permisos:

1. **Espera 2-5 minutos** para que los cambios se propaguen
2. **Vuelve a intentar el despliegue:**
   ```bash
   npx firebase deploy --only functions
   ```

## Verificar permisos actuales:

```bash
# Ver roles de la cuenta de servicio
gcloud projects get-iam-policy port-management-9bd53 \
  --flatten="bindings[].members" \
  --filter="bindings.members:355954173896-compute@developer.gserviceaccount.com"
```
