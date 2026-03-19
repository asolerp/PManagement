/**
 * Devuelve la URL solo si es válida y no es de Cloudinary (evita 404 y peticiones inútiles).
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function getSafeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('cloudinary')) return null;
  return url;
}
