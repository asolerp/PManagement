/**
 * Descarga archivos (voz, foto) desde Telegram Bot API.
 */

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Obtiene file_path para un file_id.
 * @param {string} botToken
 * @param {string} fileId
 * @returns {Promise<{ file_path: string }>}
 */
async function getFile(botToken, fileId) {
  const url = `${TELEGRAM_API}/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || "Telegram getFile error");
  }
  return data.result;
}

/**
 * Descarga el archivo y devuelve un Buffer.
 * @param {string} botToken
 * @param {string} filePath - result.file_path de getFile
 * @returns {Promise<Buffer>}
 */
async function downloadFile(botToken, filePath) {
  const url = `${TELEGRAM_API}/file/bot${botToken}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Telegram download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Descarga un archivo de voz o foto por file_id. Devuelve el buffer y la extensión sugerida.
 * @param {string} botToken
 * @param {string} fileId
 * @param {'voice'|'photo'} type - voice → .ogg, photo → .jpg
 * @returns {Promise<{ buffer: Buffer, extension: string }>}
 */
async function downloadTelegramFile(botToken, fileId, type = "voice") {
  const { file_path } = await getFile(botToken, fileId);
  const buffer = await downloadFile(botToken, file_path);
  const extension = type === "voice" ? "ogg" : "jpg";
  return { buffer, extension };
}

module.exports = {
  getFile,
  downloadFile,
  downloadTelegramFile,
};
