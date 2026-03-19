/**
 * Callable: optimiza el orden de los jobs de un cuadrante para un trabajador
 * usando coordenadas de propiedades y opcional punto de partida del trabajador.
 * Orden: nearest-neighbor por distancia Haversine (km) + mejora 2-opt. Sin API externa (gratis).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

function getCoords(doc) {
  const loc = doc?.location ?? doc?.homeLocation;
  if (
    !loc ||
    typeof loc.latitude !== 'number' ||
    typeof loc.longitude !== 'number'
  )
    return null;
  return { lat: loc.latitude, lng: loc.longitude };
}

/** Distancia Haversine en km (más real que distancia al cuadrado en lat/lng). */
function haversineKm(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/**
 * Ordena jobIds por nearest-neighbor desde origin (distancia Haversine).
 * CoordsMap: { houseId: { lat, lng } }.
 */
function nearestNeighborOrder(jobIds, coordsMap, origin) {
  const remaining = new Set(jobIds);
  const ordered = [];
  let current = origin || null;

  while (remaining.size > 0) {
    let nearestId = null;
    let nearestDist = Infinity;
    for (const jid of remaining) {
      const c = coordsMap[jid];
      if (!c) {
        nearestId = jid;
        nearestDist = 0;
        break;
      }
      const d = haversineKm(current, c);
      if (d < nearestDist) {
        nearestDist = d;
        nearestId = jid;
      }
    }
    if (nearestId == null) break;
    ordered.push(nearestId);
    remaining.delete(nearestId);
    current = coordsMap[nearestId] || current;
  }

  remaining.forEach(jid => ordered.push(jid));
  return ordered;
}

/** Mejora el orden con 2-opt: invierte segmentos si reduce la distancia total. */
function twoOptImprove(orderedIds, coordsMap, origin) {
  const n = orderedIds.length;
  if (n < 3) return orderedIds;

  function totalKm(ids) {
    let sum = 0;
    let prev = origin || (coordsMap[ids[0]] ? { ...coordsMap[ids[0]] } : null);
    for (const id of ids) {
      const c = coordsMap[id];
      if (prev && c) sum += haversineKm(prev, c);
      if (c) prev = c;
    }
    return sum;
  }

  let best = [...orderedIds];
  let bestDist = totalKm(best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const next = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1)
        ];
        const d = totalKm(next);
        if (d < bestDist) {
          best = next;
          bestDist = d;
          improved = true;
        }
      }
    }
  }
  return best;
}

exports.optimizeRoute = onCall(
  { region: REGION, timeoutSeconds: 60, memory: '256MiB' },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { quadrantId, workerId } = request.data || {};

    if (!quadrantId) {
      throw new HttpsError('invalid-argument', 'quadrantId is required.');
    }

    const db = admin.firestore();
    const jobsRef = db
      .collection('quadrants')
      .doc(quadrantId)
      .collection('jobs');
    const jobsSnap = await jobsRef.get();
    let jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (workerId) {
      jobs = jobs.filter(j => {
        const wid = j.worker?.id ?? j.workersId?.[0];
        return wid === workerId;
      });
    }

    if (jobs.length === 0) {
      return { orderedJobIds: [], message: 'No jobs to order.' };
    }

    const houseIds = [...new Set(jobs.map(j => j.houseId).filter(Boolean))];
    const coordsMap = {};
    for (const hid of houseIds) {
      const propSnap = await db.collection('houses').doc(hid).get();
      const coords = getCoords(propSnap.exists ? propSnap.data() : {});
      if (coords) coordsMap[hid] = coords;
    }

    let origin = null;
    if (workerId) {
      const userSnap = await db.collection('users').doc(workerId).get();
      if (userSnap.exists) origin = getCoords(userSnap.data());
    }

    const houseIdsOrdered = [
      ...new Set(jobs.map(j => j.houseId).filter(Boolean))
    ];
    let houseOrder = nearestNeighborOrder(houseIdsOrdered, coordsMap, origin);
    houseOrder = twoOptImprove(houseOrder, coordsMap, origin);
    const orderIndex = {};
    houseOrder.forEach((hid, i) => {
      orderIndex[hid] = i;
    });
    const orderedJobs = [...jobs].sort((a, b) => {
      const ia = orderIndex[a.houseId] ?? 9999;
      const ib = orderIndex[b.houseId] ?? 9999;
      return ia - ib;
    });
    const orderedJobIds = orderedJobs.map(j => j.id);

    return { orderedJobIds };
  }
);
