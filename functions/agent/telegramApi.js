/**
 * Envío de mensajes al usuario por Telegram Bot API.
 */

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Envía un mensaje de texto al chat.
 * @param {string} botToken - Token del bot
 * @param {number|string} chatId - ID del chat (message.chat.id)
 * @param {string} text - Texto a enviar (máx 4096 caracteres)
 * @returns {Promise<object>} Respuesta de la API
 */
async function sendMessage(botToken, chatId, text) {
  const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
  return data;
}

/**
 * Envía un mensaje con teclado inline.
 * @param {string} botToken
 * @param {number|string} chatId
 * @param {string} text
 * @param {Array<Array<{ text: string, callback_data: string }>>} inlineKeyboard - Filas de botones
 * @returns {Promise<object>}
 */
async function sendMessageWithKeyboard(botToken, chatId, text, inlineKeyboard) {
  const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: inlineKeyboard }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
  return data;
}

/**
 * Responde a un callback_query (para quitar el "loading" del botón).
 * @param {string} botToken
 * @param {string} callbackQueryId
 */
async function answerCallbackQuery(botToken, callbackQueryId) {
  const url = `${TELEGRAM_API}/bot${botToken}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  }).catch(() => {});
}

async function sendTypingAction(botToken, chatId) {
  const url = `${TELEGRAM_API}/bot${botToken}/sendChatAction`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' })
  }).catch(() => {});
}

module.exports = {
  sendMessage,
  sendMessageWithKeyboard,
  answerCallbackQuery,
  sendTypingAction
};
