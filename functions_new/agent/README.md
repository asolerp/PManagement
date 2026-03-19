# Agente IA – Telegram

Webhook que recibe mensajes de Telegram, identifica al usuario por `telegramId`, carga contexto de la empresa (cuadrante, incidencias, trabajos) y responde usando OpenAI.

## Configuración

1. **Crear bot en Telegram:** [@BotFather](https://t.me/BotFather) → `/newbot` → guardar el token.

2. **Secrets en Firebase:**
   ```bash
   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
   firebase functions:secrets:set OPENAI_API_KEY
   ```
   (Si ya tienes `OPENAI_API_KEY` por el template de emails, no hace falta volver a crearlo.)

3. **Vincular un usuario:** En Firestore, en el documento del usuario admin en `users/{uid}`, añadir:
   - `telegramId`: string, el ID numérico de Telegram (ej. `"123456789"`).
   Para obtener tu ID: envía un mensaje al bot y revisa los logs de la función o usa [@userinfobot](https://t.me/userinfobot).

4. **Webhook:** Tras desplegar, registrar la URL en Telegram:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<region>-<project>.cloudfunctions.net/telegramWebhook"
   ```

## Despliegue

```bash
cd functions
npm install
firebase deploy --only functions:telegramWebhook
```

## Estructura

- `telegramWebhook.js` – HTTP handler, resuelve usuario, contexto, LLM, envía respuesta.
- `getCompanyContext.js` – Lee Firestore (quadrants, incidents, jobs) por `companyId` y devuelve texto para el prompt.
- `llm.js` – Llama a OpenAI con contexto + mensaje del usuario.
- `telegramApi.js` – `sendMessage` a la API de Telegram.
- `config.js` – Referencias a secrets (TELEGRAM_BOT_TOKEN, OPENAI_API_KEY).

## Diseño completo

Ver [docs/AGENTE_IA_CHATBOT.md](../../docs/AGENTE_IA_CHATBOT.md) en la raíz del repo.
