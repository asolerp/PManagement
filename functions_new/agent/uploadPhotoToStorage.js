/**
 * Sube una foto (buffer) a Firebase Storage y devuelve una URL de descarga.
 * Ruta: companies/{companyId}/inspections/{timestamp}_{id}.jpg
 */

const admin = require("firebase-admin");

const SIGNED_URL_EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000; // 10 años

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * @param {string} companyId
 * @param {Buffer} buffer
 * @param {string} contentType - ej. image/jpeg, image/png
 * @returns {Promise<string>} URL para acceder a la foto (signed URL)
 */
async function uploadPhotoToStorage(
  companyId,
  buffer,
  contentType = "image/jpeg",
) {
  const bucket = admin.storage().bucket();
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `companies/${companyId}/inspections/${Date.now()}_${shortId()}.${ext}`;
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: {
      contentType,
    },
  });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + SIGNED_URL_EXPIRY_MS,
  });

  return url;
}

module.exports = {
  uploadPhotoToStorage,
};
