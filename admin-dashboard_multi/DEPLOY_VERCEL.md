# Desplegar admin-dashboard en Vercel

## 1. Conectar el proyecto

- Entra en [vercel.com](https://vercel.com) e inicia sesión.
- **Add New** → **Project**.
- Importa el repo (GitHub/GitLab/Bitbucket) y elige el **root** del repo.
- En **Root Directory** pon: `admin-dashboard` (así Vercel usa solo esta carpeta).
- **Framework Preset**: Vite (debería detectarse solo).

## 2. Variables de entorno

En el proyecto de Vercel → **Settings** → **Environment Variables** añade (para Production y Preview si quieres):

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | API Key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain (ej. `tu-proyecto.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket (ej. `tu-proyecto.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de mensajería |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase |

(Opcional) Para emuladores en preview: `VITE_USE_EMULATORS` = `true` (solo si apuntas a emuladores).

## 3. Deploy

- **Deploy**: Vercel usará `npm run build` y publicará la carpeta `dist`.
- La SPA queda configurada con `vercel.json` para que el routing (React Router) funcione bien.

## Deploy desde la terminal

Con [Vercel CLI](https://vercel.com/docs/cli) instalado:

```bash
cd admin-dashboard
npm i -g vercel
vercel
```

Sigue los pasos (link al proyecto o proyecto nuevo) y configura las variables de entorno cuando te lo pida o en el dashboard.
