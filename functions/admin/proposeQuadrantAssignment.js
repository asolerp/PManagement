/**
 * Callable: propone una combinación óptima de trabajadores y casas para un día.
 * Dadas unas casas y unos trabajadores, asigna cada casa a un trabajador y sugiere
 * franjas horarias (por proximidad si hay coordenadas, o reparto equilibrado).
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

function distanceSq(a, b) {
  if (!a || !b) return Infinity;
  const dlat = a.lat - b.lat;
  const dlng = a.lng - b.lng;
  return dlat * dlat + dlng * dlng;
}

/** Ordena houseIds por nearest-neighbor desde origin. */
function nearestNeighborOrder(houseIds, coordsMap, origin) {
  const remaining = [...houseIds];
  const ordered = [];
  let current = origin || null;

  while (remaining.length > 0) {
    let nearestId = null;
    let nearestDist = Infinity;
    let nearestIdx = -1;
    for (let i = 0; i < remaining.length; i++) {
      const hid = remaining[i];
      const c = coordsMap[hid];
      if (!c) {
        nearestId = hid;
        nearestIdx = i;
        break;
      }
      const d = distanceSq(current, c);
      if (d < nearestDist) {
        nearestDist = d;
        nearestId = hid;
        nearestIdx = i;
      }
    }
    if (nearestId == null) break;
    ordered.push(nearestId);
    remaining.splice(nearestIdx, 1);
    current = coordsMap[nearestId] || current;
  }
  ordered.push(...remaining);
  return ordered;
}

/** Distancia Haversine en km. */
function haversineKm(a, b) {
  if (!a || !b) return 0;
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
 * Minutos de desplazamiento entre dos puntos (por carretera ~40 km/h de media).
 * Sin coordenadas devuelve fallbackMin. Mínimo 5 min, máximo 90 min.
 */
function travelMinutesBetween(a, b, fallbackMin = 15) {
  if (!a || !b) return fallbackMin;
  const km = haversineKm(a, b);
  const minByDistance = Math.round((km / 40) * 60);
  return Math.min(90, Math.max(5, minByDistance));
}

/** Parsea "HH:mm" a minutos desde medianoche. */
function parseTimeToMinutes(str) {
  if (!str || typeof str !== 'string') return 8 * 60; // 08:00
  const [h, m] = str.trim().split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Convierte minutos desde medianoche a "HH:mm". */
function minutesToTime(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

exports.proposeQuadrantAssignment = onCall(
  { region: REGION, timeoutSeconds: 60, memory: '256MiB' },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const {
      date,
      houseIds = [],
      workerIds = [],
      options = {}
    } = request.data || {};

    if (!date || !Array.isArray(houseIds) || !Array.isArray(workerIds)) {
      throw new HttpsError(
        'invalid-argument',
        'Se requieren date, houseIds y workerIds (arrays).'
      );
    }

    const defaultDurationMinutes = options.defaultDurationMinutes ?? 120;
    const travelBufferMinutes = options.travelBufferMinutes ?? 15;
    const houseDurations =
      options.houseDurations && typeof options.houseDurations === 'object'
        ? options.houseDurations
        : {};
    const globalWorkStartMin = parseTimeToMinutes(options.workStart || '08:00');
    const globalWorkEndMin = parseTimeToMinutes(options.workEnd || '18:00');
    const workerWorkHoursRaw =
      (options.workerWorkHours && typeof options.workerWorkHours === 'object'
        ? options.workerWorkHours
        : null) ||
      (request.data &&
      request.data.workerWorkHours &&
      typeof request.data.workerWorkHours === 'object'
        ? request.data.workerWorkHours
        : null);
    const workerWorkHours = workerWorkHoursRaw || {};

    function getWorkBounds(workerId) {
      const wh = workerWorkHours[workerId];
      const hasWh =
        wh &&
        typeof wh === 'object' &&
        (wh.workStart != null || wh.workEnd != null);
      if (hasWh) {
        return {
          workStartMin: parseTimeToMinutes(String(wh.workStart || '08:00')),
          workEndMin: parseTimeToMinutes(String(wh.workEnd || '18:00'))
        };
      }
      return { workStartMin: globalWorkStartMin, workEndMin: globalWorkEndMin };
    }

    /** Máximo de casas que caben en la ventana del trabajador. */
    function getMaxHousesForWorker(workerId) {
      const { workStartMin, workEndMin } = getWorkBounds(workerId);
      const availableMin = Math.max(0, workEndMin - workStartMin);
      const minSlotMin = defaultDurationMinutes + travelBufferMinutes;
      return minSlotMin > 0 ? Math.floor(availableMin / minSlotMin) : 0;
    }

    const db = admin.firestore();
    const uniqueHouseIds = [...new Set(houseIds)].filter(Boolean);
    const uniqueWorkerIds = [...new Set(workerIds)].filter(Boolean);

    if (uniqueHouseIds.length === 0 || uniqueWorkerIds.length === 0) {
      return {
        assignments: [],
        message: 'Añade al menos una casa y un trabajador.'
      };
    }

    const housesMap = {};
    const coordsMap = {};
    for (const hid of uniqueHouseIds) {
      const snap = await db.collection('houses').doc(hid).get();
      if (!snap.exists) continue;
      const data = snap.data();
      housesMap[hid] = {
        id: hid,
        houseName: data.houseName || data.address || hid,
        ...data
      };
      const coords = getCoords(data);
      if (coords) coordsMap[hid] = coords;
    }
    const validHouseIds = Object.keys(housesMap);

    const workersMap = {};
    const workerOrigins = {};
    for (const uid of uniqueWorkerIds) {
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) continue;
      const data = snap.data();
      const name =
        [data.firstName, data.lastName].filter(Boolean).join(' ') ||
        data.name ||
        data.email ||
        uid;
      workersMap[uid] = {
        id: uid,
        firstName: data.firstName,
        lastName: data.lastName,
        name,
        token: data.token
      };
      const coords = getCoords(data);
      if (coords) workerOrigins[uid] = coords;
    }
    const validWorkerIds = Object.keys(workersMap);

    if (validHouseIds.length === 0 || validWorkerIds.length === 0) {
      return {
        assignments: [],
        message: 'No se encontraron casas o trabajadores válidos.'
      };
    }

    const maxHousesPerWorker = {};
    validWorkerIds.forEach(wid => {
      maxHousesPerWorker[wid] = Math.max(1, getMaxHousesForWorker(wid));
    });

    const workerHouseIds = {};
    validWorkerIds.forEach(wid => (workerHouseIds[wid] = []));

    const hasCoords =
      validHouseIds.some(hid => coordsMap[hid]) &&
      validWorkerIds.some(wid => workerOrigins[wid]);

    function chooseWorkerForHouse(houseId) {
      const houseCoords = coordsMap[houseId];
      const withCapacity = validWorkerIds.filter(
        wid => workerHouseIds[wid].length < maxHousesPerWorker[wid]
      );
      const candidates =
        withCapacity.length > 0 ? withCapacity : validWorkerIds;
      if (houseCoords && candidates.length > 0) {
        let bestWorkerId = candidates[0];
        let bestDist = Infinity;
        for (const wid of candidates) {
          const origin = workerOrigins[wid];
          const d = origin ? distanceSq(houseCoords, origin) : Infinity;
          if (d < bestDist) {
            bestDist = d;
            bestWorkerId = wid;
          }
        }
        return bestWorkerId;
      }
      const idx = validHouseIds.indexOf(houseId) % candidates.length;
      return candidates[idx] || validWorkerIds[0];
    }

    if (hasCoords) {
      for (const houseId of validHouseIds) {
        const bestWorkerId = chooseWorkerForHouse(houseId);
        workerHouseIds[bestWorkerId].push(houseId);
      }
    } else {
      validHouseIds.forEach(houseId => {
        const wid = chooseWorkerForHouse(houseId);
        workerHouseIds[wid].push(houseId);
      });
    }

    const assignments = [];

    for (const workerId of validWorkerIds) {
      const houseIdsForWorker = workerHouseIds[workerId];
      if (houseIdsForWorker.length === 0) continue;

      const origin = workerOrigins[workerId] || null;
      const orderedHouseIds = nearestNeighborOrder(
        houseIdsForWorker,
        coordsMap,
        origin
      );
      const worker = workersMap[workerId];
      const { workStartMin, workEndMin } = getWorkBounds(workerId);

      let currentMin = workStartMin;
      let prevCoords = origin;
      for (const houseId of orderedHouseIds) {
        const houseCoords = coordsMap[houseId];
        const travelMin = travelMinutesBetween(
          prevCoords,
          houseCoords,
          travelBufferMinutes
        );
        currentMin += travelMin;
        if (currentMin >= workEndMin) break;
        const duration = Math.max(
          1,
          Number(houseDurations[houseId]) || defaultDurationMinutes
        );
        const endMin = Math.min(currentMin + duration, workEndMin);
        if (endMin <= currentMin) break;

        const startTime = minutesToTime(currentMin);
        const endTime = minutesToTime(endMin);
        const house = housesMap[houseId];
        assignments.push({
          houseId,
          workerId,
          startTime,
          endTime,
          worker: {
            id: worker.id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            token: worker.token
          },
          house: house
            ? { id: house.id, houseName: house.houseName }
            : { id: houseId, houseName: houseId }
        });
        currentMin = endMin;
        prevCoords = houseCoords || prevCoords;
      }
    }

    return {
      assignments,
      date:
        typeof date === 'string'
          ? date
          : date && date.toDate
            ? date.toDate().toISOString().slice(0, 10)
            : null
    };
  }
);
