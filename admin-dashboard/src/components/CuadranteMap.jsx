import { useMemo, useEffect, useId, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [map, points]);
  return null;
}

export default function CuadranteMap({ jobs = [], housesById = {}, compact = false }) {
  const heightClass = compact ? 'h-36' : 'h-48';
  const mapId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);

  const points = useMemo(() => {
    const out = [];
    jobs.forEach((job, index) => {
      const house = job.houseId ? housesById[job.houseId] : null;
      const loc = house?.location;
      if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        const name = house?.houseName || job.house?.houseName || job.house?.[0]?.houseName || 'Casa';
        out.push({ lat: loc.latitude, lng: loc.longitude, order: index + 1, name, label: `${index + 1}. ${name}` });
      }
    });
    return out;
  }, [jobs, housesById]);

  if (points.length === 0) {
    return (<div className={`rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center ${heightClass} text-sm text-gray-500`}>Añade coordenadas a las casas para ver la ruta en el mapa</div>);
  }

  const center = { lat: points.reduce((a, p) => a + p.lat, 0) / points.length, lng: points.reduce((a, p) => a + p.lng, 0) / points.length };

  if (!mounted) {
    return (<div className={`rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center ${heightClass} text-sm text-gray-400`}>Cargando mapa…</div>);
  }

  return (
    <div key={mapId} className={`rounded-xl border border-gray-200 overflow-hidden ${heightClass} w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:z-0`}>
      <MapContainer key={mapId} center={[center.lat, center.lng]} zoom={11} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={points} />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Tooltip direction="top" permanent={false}><span className="font-semibold">Parada {p.order}</span><br />{p.name}</Tooltip>
            <Popup><span className="font-semibold">Parada {p.order} de la ruta</span><br />{p.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
