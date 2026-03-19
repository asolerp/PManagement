const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const REQUEST_TIMEOUT_MS = 15000;
const NOMINATIM_DELAY_MS = 1100;

function buildQuery(address) {
  if (typeof address === 'string') return address.trim();
  const parts = [
    address.street,
    address.municipio,
    address.cp,
  ].filter(Boolean);
  return parts.map((p) => String(p).trim()).join(', ');
}

function buildQueryVariants(address) {
  if (typeof address === 'string') {
    const q = address.trim();
    if (!q) return [];
    const variants = [q, `${q}, España`];
    const parts = q.split(',').map((p) => p.trim());
    if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
      const withoutLast = parts.slice(0, -1).join(', ');
      if (withoutLast) variants.push(withoutLast, `${withoutLast}, España`);
    }
    return [...new Set(variants)];
  }
  const street = (address.street || '').trim();
  const municipio = (address.municipio || '').trim();
  const cp = (address.cp || '').trim();
  const full = [street, municipio, cp].filter(Boolean).join(', ');
  if (!full) return [];

  const variants = [full];

  if (cp && (street || municipio)) {
    const withoutCp = [street, municipio].filter(Boolean).join(', ');
    if (withoutCp) variants.push(withoutCp);
  }

  if (street) {
    const simplified = street.replace(/,?\s*\d+\s*$/, '').trim() || street;
    if (simplified !== street) {
      const withSimplified = [simplified, municipio, cp].filter(Boolean).join(', ');
      if (withSimplified) variants.push(withSimplified);
    }
  }

  if (municipio && cp) variants.push(`${municipio}, ${cp}, España`);
  if (municipio) variants.push(`${municipio}, España`);

  return [...new Set(variants)];
}

async function fetchNominatim(query, signal) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'es',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.[0];
  if (!first?.lat || !first?.lon) return null;
  const latitude = parseFloat(first.lat, 10);
  const longitude = parseFloat(first.lon, 10);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return { latitude, longitude };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeAddress(address) {
  const variants = buildQueryVariants(address);
  if (variants.length === 0) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    for (let i = 0; i < variants.length; i++) {
      if (i > 0) await delay(NOMINATIM_DELAY_MS);
      const result = await fetchNominatim(variants[i], controller.signal);
      if (result) {
        clearTimeout(timeoutId);
        return result;
      }
    }
    clearTimeout(timeoutId);
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export function isValidCoord(value) {
  const n = Number(value);
  return typeof value !== 'undefined' && value !== '' && !Number.isNaN(n) && n >= -90 && n <= 90;
}

export function isValidLng(value) {
  const n = Number(value);
  return typeof value !== 'undefined' && value !== '' && !Number.isNaN(n) && n >= -180 && n <= 180;
}

export function toLocationObject({ latitude, longitude }) {
  const lat = latitude !== undefined && latitude !== '' ? Number(latitude) : NaN;
  const lng = longitude !== undefined && longitude !== '' ? Number(longitude) : NaN;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}
