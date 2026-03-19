/**
 * Agente IA: webhook Telegram para consultas al dashboard (cuadrante, incidencias, etc.).
 * Ver docs/AGENTE_IA_CHATBOT.md para diseño y configuración.
 */

const { telegramWebhook } = require("./telegramWebhook");

module.exports = {
  telegramWebhook,
};
