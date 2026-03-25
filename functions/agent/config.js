/**
 * Configuración del agente (Telegram, LLM, Observabilidad).
 * En producción usar Firebase Secrets:
 *   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
 *   firebase functions:secrets:set OPENAI_API_KEY
 *   firebase functions:secrets:set GRAFANA_LOKI_URL
 *   firebase functions:secrets:set GRAFANA_LOKI_USER
 *   firebase functions:secrets:set GRAFANA_LOKI_TOKEN
 */

const { defineSecret } = require('firebase-functions/params');

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const grafanaLokiUrl = defineSecret('GRAFANA_LOKI_URL');
const grafanaLokiUser = defineSecret('GRAFANA_LOKI_USER');
const grafanaLokiToken = defineSecret('GRAFANA_LOKI_TOKEN');

module.exports = {
  telegramBotToken,
  openaiApiKey,
  grafanaLokiUrl,
  grafanaLokiUser,
  grafanaLokiToken
};
