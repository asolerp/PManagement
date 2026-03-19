/**
 * Geocodificación de direcciones para ubicación en mapa y rutas.
 * Usa Nominatim (OpenStreetMap), sin API key. Para producción con alto volumen
 * considerar Google Geocoding API o Mapbox (configurar en .env).
 * @see plan Fase 4 - Coordenadas en propiedades / punto partida trabajador
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const REQUEST_TIMEOUT_MS = 15000; // varias variantes con delay 1.1s entre ellas
const NOMINATIM_DELAY_MS = 1100; // respetar ~1 req/seg

/**
 * Construye una cadena de búsqueda a partir de dirección, municipio, CP.
 * @param {{ street?: string, municipio?: string, cp?: string } | string} address - Objeto con campos o string
 * @returns {string}
 */
function buildQuery(address) {
  if (typeof address === 'string') return address.trim();
  const parts = [
    address.street,
    address.municipio,
    address.cp,
  ].filter(Boolean);
  return parts.map((p) => String(p).trim()).join(', ');
}

/**
 * Genera variantes de la dirección para intentar cuando la completa falla.
 * Nominatim suele devolver vacío con direcciones muy concretas (piso, puerta).
 * @param {{ street?: string, municipio?: string, cp?: string } | string} address
 * @returns {string[]}
 */
function buildQueryVariants(address) {
  if (typeof address === 'string') {
    const q = address.trim();
    if (!q) return [];
    const variants = [q, `${q}, España`];
    // Quitar último token si es solo un número (piso/puerta) para intentar sin él
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

  // Sin CP (a veces el CP confunde)
  if (cp && (street || municipio)) {
    const withoutCp = [street, municipio].filter(Boolean).join(', ');
    if (withoutCp) variants.push(withoutCp);
  }

  // Calle simplificada: quitar posibles "22, 6" dejando solo "22" o nombre
  if (street) {
    const simplified = street.replace(/,?\s*\d+\s*$/, '').trim() || street;
    if (simplified !== street) {
      const withSimplified = [simplified, municipio, cp].filter(Boolean).join(', ');
      if (withSimplified) variants.push(withSimplified);
    }
  }

  // Municipio + CP + España (centro de zona)
  if (municipio && cp) variants.push(`${municipio}, ${cp}, España`);
  if (municipio) variants.push(`${municipio}, España`);

  return [...new Set(variants)];
}

/**
 * Una petición a Nominatim.
 * @param {string} query
 * @param {AbortSignal} signal
 * @returns {Promise<{ latitude: number, longitude: number } | null>}
 */
async function fetchNominatim(query, signal) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'es', // priorizar España
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

/**
 * Obtiene coordenadas (lat, lon) para una dirección usando Nominatim.
 * Si la dirección exacta no devuelve resultados, prueba variantes más genéricas
 * (sin CP, calle simplificada, solo municipio).
 * Respetar política de uso: ~1 req/seg.
 * @param {{ street?: string, municipio?: string, cp?: string } | string} address
 * @returns {Promise<{ latitude: number, longitude: number } | null>}
 */
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

/**
 * Comprueba si un valor es un número válido para coordenada.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidCoord(value) {
  const n = Number(value);
  return typeof value !== 'undefined' && value !== '' && !Number.isNaN(n) && n >= -90 && n <= 90;
}

/**
 * Comprueba si longitude es válida (-180..180).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidLng(value) {
  const n = Number(value);
  return typeof value !== 'undefined' && value !== '' && !Number.isNaN(n) && n >= -180 && n <= 180;
}

/**
 * Construye objeto location para Firestore solo si lat/lng son válidos.
 * @param {{ latitude?: string | number, longitude?: string | number }}
 * @returns {{ latitude: number, longitude: number } | null}
 */
export function toLocationObject({ latitude, longitude }) {
  const lat = latitude !== undefined && latitude !== '' ? Number(latitude) : NaN;
  const lng = longitude !== undefined && longitude !== '' ? Number(longitude) : NaN;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}
