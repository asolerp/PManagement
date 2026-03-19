/**
 * Configuración del agente (Telegram, LLM).
 * En producción usar Firebase Secrets:
 *   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
 *   firebase functions:secrets:set OPENAI_API_KEY
 */

const { defineSecret } = require("firebase-functions/params");

const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const openaiApiKey = defineSecret("OPENAI_API_KEY");

module.exports = {
  telegramBotToken,
  openaiApiKey,
};
