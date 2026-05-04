import { useEffect, useId, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const houseIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function HouseLocationMap({ house, height = 'h-40', zoom = 14 }) {
  const mapId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const lat = Number(house?.location?.latitude);
  const lng = Number(house?.location?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasCoords) {
    return (
      <div className={`relative ${height} bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs text-stone-500`}>
        Sin coordenadas
      </div>
    );
  }
  if (!mounted) {
    return <div className={`${height} bg-stone-100 dark:bg-stone-800 animate-pulse`} />;
  }

  const label = house?.houseName || house?.street || 'Casa';

  return (
    <div className={`${height} w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:z-0`}>
      <MapContainer
        key={mapId}
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={houseIcon}>
          <Tooltip direction="top" permanent={false}>{label}</Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
