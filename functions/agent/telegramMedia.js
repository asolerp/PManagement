/**
 * Descarga archivos (voz, foto) desde Telegram Bot API.
 */

const TELEGRAM_API = 'https://api.telegram.org';

async function getFile(botToken, fileId) {
  const url = `${TELEGRAM_API}/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram getFile error');
  }
  return data.result;
}

async function downloadFile(botToken, filePath) {
  const url = `${TELEGRAM_API}/file/bot${botToken}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Telegram download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function downloadTelegramFile(botToken, fileId, type = 'voice') {
  const { file_path } = await getFile(botToken, fileId);
  const buffer = await downloadFile(botToken, file_path);
  const extension = type === 'voice' ? 'ogg' : 'jpg';
  return { buffer, extension };
}

module.exports = {
  getFile,
  downloadFile,
  downloadTelegramFile
};
