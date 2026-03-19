/**
 * Envío de mensajes al usuario por Telegram Bot API.
 */

const TELEGRAM_API = "https://api.telegram.org";

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
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || "Telegram API error");
  }
  return data;
}

module.exports = {
  sendMessage,
};
