export function getSafeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('cloudinary')) return null;
  return url;
}
