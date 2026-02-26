# Checklist: credenciales para firmar el build de Android

Para que el build de release de Android se firme correctamente (local o EAS), necesitas lo siguiente.

---

## 1. Keystore (archivo)

- **Ubicación:** `android/app/portmanagement.keystore`  
  (o la ruta que definas en `ANDROID_KEYSTORE_PATH`)

- **Comprobar que existe (sin commitearlo):**
  ```bash
  ls -la android/app/portmanagement.keystore
  ```

- Si ya tenías una versión publicada antes, **debes usar el mismo keystore** para poder actualizar la app. Si lo perdiste, no podrás actualizar esa app en Play Store (tendrías que publicar como app nueva).

---

## 2. Contraseñas y alias

Necesitas cuatro valores (los mismos que usaste al crear el keystore o los que te dieron con el keystore existente):

| Variable / Uso | Descripción | Dónde se usa |
|----------------|-------------|--------------|
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore | Build local y EAS |
| `ANDROID_KEY_PASSWORD` | Contraseña de la key | Build local y EAS |
| `ANDROID_KEY_ALIAS` | Alias de la key (por defecto `portmanagement`) | Build local y EAS |
| `ANDROID_KEYSTORE_PATH` | Nombre del archivo (por defecto `portmanagement.keystore`) | Build local |

---

## 3. Build local

- Crea `.env` en la raíz (puedes copiar `env.example`) y rellena:
  ```bash
  ANDROID_KEYSTORE_PATH=portmanagement.keystore
  ANDROID_KEYSTORE_PASSWORD=tu_password_real
  ANDROID_KEY_ALIAS=portmanagement
  ANDROID_KEY_PASSWORD=tu_password_real
  ```
- O exporta las variables antes de construir:
  ```bash
  export ANDROID_KEYSTORE_PASSWORD="..."
  export ANDROID_KEY_PASSWORD="..."
  npx expo run:android --variant release
  ```

- **Alternativa:** en `android/gradle.properties` están `MYAPP_UPLOAD_*`; si no usas `.env`, sustituye `CAMBIA_ESTO_POR_TU_PASSWORD` por las contraseñas reales (y **no** hagas commit de ese cambio).

---

## 4. EAS Build (nube)

Para que EAS firme el build necesitas **subir el keystore y las contraseñas** una vez:

1. **Keystore en EAS**
   ```bash
   eas credentials
   ```
   - Elige **Android** → **Set up build credentials** (o **Use existing** si ya lo hiciste).
   - Sube el archivo `android/app/portmanagement.keystore` cuando te lo pida.

2. **Secretos en EAS** (contraseñas; no se commitear)
   ```bash
   eas secret:create --scope project --name ANDROID_KEYSTORE_PASSWORD --value "tu_password"
   eas secret:create --scope project --name ANDROID_KEY_PASSWORD --value "tu_password"
   ```
   Si ya existen, no hace falta volver a crearlos.

3. Comprobar en [expo.dev](https://expo.dev) → tu proyecto → **Credentials** → Android: debe aparecer el keystore y los secretos asociados.

---

## 5. Resumen: ¿tengo todo?

| Requisito | Local | EAS |
|-----------|--------|-----|
| Archivo `android/app/portmanagement.keystore` | ✅ Sí | ✅ Subido en EAS |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ En `.env` o export | ✅ En EAS Secrets |
| `ANDROID_KEY_PASSWORD` | ✅ En `.env` o export | ✅ En EAS Secrets |
| `ANDROID_KEY_ALIAS` | ✅ Por defecto `portmanagement` | ✅ Mismo en EAS |

Si ya tenías una versión publicada, el **mismo keystore** debe estar en `android/app/` (local) y en EAS (Credentials), con las mismas contraseñas. Con eso tienes todas las credenciales necesarias para firmar el build de Android.
