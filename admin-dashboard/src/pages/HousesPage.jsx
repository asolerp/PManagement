import { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useHouses,
  useUpdateHouse,
  useCreateHouse,
  useUploadHouseImage,
  useOwners,
  useChecklists,
  useIncidences,
  useJobs,
} from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Home, X, MapPin, User, Save, Plus, Camera, ChevronDown, Check, CheckSquare, AlertCircle, Briefcase, CheckCircle, ChevronRight, ExternalLink, LayoutGrid, Rows3 } from 'lucide-react';
import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import { DataTable } from '@/components/ui/DataTable';
import { Pill } from '@/components/ui/Pill';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { QualityBar } from '@/components/ui/QualityBar';
import { geocodeAddress, toLocationObject } from '@/utils/geocoding';

const PLACEHOLDER_IMAGE = '/placeholder-house.png';

function HouseImage({ src, size = 'sm' }) {
  const [error, setError] = useState(false);
  const hasSrc = !error && src;

  const sizeClasses = {
    sm: 'w-16 h-16 rounded-lg',
    lg: 'w-full h-48 rounded-xl',
  };

  if (!hasSrc) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#126D9B]/5 to-[#3B8D7A]/10 flex items-center justify-center`}
      >
        <img
          src={PLACEHOLDER_IMAGE}
          alt="Port Management SL"
          className={size === 'lg' ? 'h-20 object-contain opacity-40' : 'h-8 object-contain opacity-40'}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`${sizeClasses[size]} object-cover bg-gray-100`}
      onError={() => setError(true)}
    />
  );
}

function getIncidenceHouseId(incidence) {
  if (incidence.houseId) return incidence.houseId;
  if (incidence.house?.id) return incidence.house.id;
  if (incidence.house?.[0]?.id) return incidence.house[0].id;
  return null;
}

function toDate(value) {
  if (!value) return null;
  try {
    let d = null;
    if (value.toDate && typeof value.toDate === 'function') d = value.toDate();
    else if (value.seconds != null) d = new Date(value.seconds * 1000);
    else if (value._d instanceof Date) d = value._d;
    else d = new Date(value);
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

function HouseDetailPanel({ house, onClose, onOpenChecklist }) {
  const updateHouse = useUpdateHouse();
  const uploadImage = useUploadHouseImage();
  const { data: checklists = [], isLoading: loadingChecklists, isError: checklistsError } = useChecklists({ houseId: house.id });
  const { data: incidences = [], isLoading: loadingIncidences } = useIncidences();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();

  const houseIncidences = useMemo(
    () => incidences.filter((inc) => getIncidenceHouseId(inc) === house.id),
    [incidences, house.id]
  );
  const houseJobs = useMemo(
    () => jobs.filter((job) => job.houseId === house.id),
    [jobs, house.id]
  );

  const [form, setForm] = useState({
    houseName: house.houseName || '',
    street: house.street || '',
    municipio: house.municipio || '',
    cp: house.cp || '',
    phone: house.phone || '',
    notes: house.notes || '',
    latitude: house.location?.latitude ?? '',
    longitude: house.location?.longitude ?? '',
  });
  const [owner, setOwner] = useState(house.owner || null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      houseName: house.houseName || '',
      street: house.street || '',
      municipio: house.municipio || '',
      cp: house.cp || '',
      phone: house.phone || '',
      notes: house.notes || '',
      latitude: house.location?.latitude ?? '',
      longitude: house.location?.longitude ?? '',
    }));
    setOwner(house.owner || null);
  }, [house.id, house.houseName, house.street, house.municipio, house.cp, house.phone, house.notes, house.location, house.owner]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { id: house.id, houseName: form.houseName, street: form.street, municipio: form.municipio, cp: form.cp, phone: form.phone, notes: form.notes };
      if (owner) payload.owner = owner;
      else payload.owner = null;
      const location = toLocationObject({ latitude: form.latitude, longitude: form.longitude });
      payload.location = location ?? (house.location ? null : undefined);
      if (payload.location === undefined) delete payload.location;
      await updateHouse.mutateAsync(payload);
      if (imageFile) {
        await uploadImage.mutateAsync({ houseId: house.id, file: imageFile });
      }
      onClose();
    } catch (e) {
      console.error('Error updating house', e);
    } finally {
      setSaving(false);
    }
  };

  const ownerChanged = (owner?.id ?? null) !== (house.owner?.id ?? null);
  const locLat = house.location?.latitude ?? '';
  const locLng = house.location?.longitude ?? '';
  const locationChanged = String(form.latitude ?? '') !== String(locLat) || String(form.longitude ?? '') !== String(locLng);
  const hasChanges =
    form.houseName !== (house.houseName || '') ||
    form.street !== (house.street || '') ||
    form.municipio !== (house.municipio || '') ||
    form.cp !== (house.cp || '') ||
    form.phone !== (house.phone || '') ||
    form.notes !== (house.notes || '') ||
    ownerChanged ||
    locationChanged ||
    !!imageFile;

  const handleGeocode = async () => {
    setGeocoding(true);
    try {
      const coords = await geocodeAddress({ street: form.street, municipio: form.municipio, cp: form.cp });
      if (coords) setForm((f) => ({ ...f, latitude: coords.latitude, longitude: coords.longitude }));
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">Ficha de casa</h2>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/casas/${house.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#126D9B] hover:bg-[#126D9B]/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver ficha completa
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Imagen */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Foto de la casa</p>
            <ImagePicker
              file={imageFile}
              preview={imagePreview || (!imageFile && house.houseImage?.original) || null}
              onChange={(file) => {
                setImageFile(file);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          {/* Datos */}
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={form.houseName}
              onChange={(e) => setForm({ ...form, houseName: e.target.value })}
            />
            <Input
              label="Dirección"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <Input
              label="Municipio"
              value={form.municipio}
              onChange={(e) => setForm({ ...form, municipio: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Código postal"
                placeholder="07001"
                value={form.cp}
                onChange={(e) => setForm({ ...form, cp: e.target.value })}
              />
              <Input
                label="Teléfono"
                placeholder="+34 600..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: código llave, acceso, observaciones..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
              />
            </div>

            {/* Ubicación (para rutas) */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Ubicación (para rutas)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitud"
                  type="number"
                  step="any"
                  placeholder="39.5696"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
                <Input
                  label="Longitud"
                  type="number"
                  step="any"
                  placeholder="2.6502"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleGeocode}
                disabled={geocoding || !(form.street || form.municipio || form.cp)}
                loading={geocoding}
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Geocodificar desde dirección
              </Button>
            </div>
          </div>

          {/* Propietario */}
          <OwnerSelector value={owner} onChange={setOwner} />

          {/* Actividad en esta propiedad */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#126D9B]" />
              Actividad en esta propiedad
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Revisiones, incidencias y trabajos vinculados a esta casa.
            </p>
            {checklistsError ? (
              <p className="text-sm text-amber-600">Error al cargar revisiones. Revisa la consola del navegador.</p>
            ) : loadingChecklists || loadingIncidences || loadingJobs ? (
              <p className="text-sm text-gray-500">Cargando actividad...</p>
            ) : checklists.length === 0 && houseIncidences.length === 0 && houseJobs.length === 0 ? (
              <p className="text-sm text-gray-500">Sin actividad registrada aún.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {checklists.map((cl) => {
                  const d = toDate(cl.date);
                  const done = cl.done ?? 0;
                  const total = cl.total ?? 0;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <li key={cl.id}>
                      <button
                        type="button"
                        onClick={() => onOpenChecklist?.(cl)}
                        className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group"
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {cl.finished ? (
                            <CheckCircle className="w-4 h-4 text-[#67B26F]" />
                          ) : (
                            <CheckSquare className="w-4 h-4 text-[#126D9B]" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#126D9B]">
                            Revisión · {done}/{total} puntos
                          </p>
                          <p className="text-xs text-gray-500">
                            {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                            {cl.finished && <span className="text-[#67B26F]"> · Finalizada</span>}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </button>
                    </li>
                  );
                })}
                {houseIncidences.map((inc) => {
                  const d = toDate(inc.date || inc.createdAt);
                  return (
                    <li key={inc.id}>
                      <Link
                        to="/incidencias"
                        className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group"
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          <AlertCircle className={`w-4 h-4 ${inc.done ? 'text-emerald-500' : 'text-amber-500'}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#126D9B]">
                            {inc.title || 'Incidencia'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                            {inc.done ? <span className="text-emerald-600"> · Cerrada</span> : <span className="text-amber-600"> · Abierta</span>}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </Link>
                    </li>
                  );
                })}
                {houseJobs.map((job) => {
                  const d = toDate(job.createdAt);
                  const statusLabel = job.status === 'completed' ? 'Completado' : job.status === 'in_progress' ? 'En curso' : 'Pendiente';
                  return (
                    <li key={job.id}>
                      <Link
                        to="/trabajos"
                        className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group"
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          <Briefcase className="w-4 h-4 text-[#126D9B]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#126D9B]">
                            {job.title || job.jobName || 'Trabajo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                            <span className="text-gray-500"> · {statusLabel}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Las comunicaciones con el propietario están en la ficha del <Link to="/propietarios" className="text-[#126D9B] hover:underline">propietario</Link>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Button
            className="w-full"
            disabled={!hasChanges}
            loading={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </aside>
    </>
  );
}

function ImagePicker({ file, preview, onChange }) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Foto de la casa
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
      {preview ? (
        <div
          className="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => inputRef.current?.click()}
        >
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-[#126D9B]/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-[#126D9B]" />
          </div>
          <span className="text-sm text-gray-500">Haz clic para añadir foto</span>
        </button>
      )}
    </div>
  );
}

function OwnerSelector({ value, onChange }) {
  const { data: owners = [], isLoading } = useOwners();
  const [open, setOpen] = useState(false);

  const selected = value
    ? owners.find((o) => o.id === value.id) || value
    : null;

  const selectedName = selected
    ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim()
    : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Propietario
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent transition-colors"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">
                {selectedName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm text-gray-900">{selectedName}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Seleccionar propietario...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">Cargando...</div>
          ) : owners.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">No hay propietarios</div>
          ) : (
            <>
              {selected && (
                <button
                  type="button"
                  onClick={() => { onChange(null); setOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-50"
                >
                  Quitar selección
                </button>
              )}
              {owners.map((owner) => {
                const name = `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
                const isSelected = selected?.id === owner.id;
                return (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => {
                      onChange({ id: owner.id, firstName: owner.firstName, lastName: owner.lastName, phone: owner.phone });
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${isSelected ? 'bg-[#126D9B]/5' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-white">
                        {name.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="flex-1">{name || 'Sin nombre'}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#126D9B]" />}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CreateHouseModal({ open, onClose }) {
  const createHouse = useCreateHouse();
  const uploadImage = useUploadHouseImage();
  const [form, setForm] = useState({
    houseName: '',
    street: '',
    municipio: '',
    cp: '',
    phone: '',
    notes: '',
    latitude: '',
    longitude: '',
  });
  const [owner, setOwner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const canSubmit = form.houseName.trim() && form.street.trim();

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ houseName: '', street: '', municipio: '', cp: '', phone: '', notes: '', latitude: '', longitude: '' });
    setOwner(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGeocode = async () => {
    setGeocoding(true);
    try {
      const coords = await geocodeAddress({ street: form.street, municipio: form.municipio, cp: form.cp });
      if (coords) setForm((f) => ({ ...f, latitude: coords.latitude, longitude: coords.longitude }));
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const houseData = { houseName: form.houseName, street: form.street, municipio: form.municipio, cp: form.cp, phone: form.phone, notes: form.notes };
      if (owner) houseData.owner = owner;
      const location = toLocationObject({ latitude: form.latitude, longitude: form.longitude });
      if (location) houseData.location = location;

      const houseId = await createHouse.mutateAsync(houseData);

      if (imageFile && houseId) {
        await uploadImage.mutateAsync({ houseId, file: imageFile });
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error('Error creating house', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva casa" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImagePicker
          file={imageFile}
          preview={imagePreview}
          onChange={handleImageChange}
        />

        <Input
          label="Nombre de la casa *"
          placeholder="Ej: Casa del Mar"
          value={form.houseName}
          onChange={(e) => setForm({ ...form, houseName: e.target.value })}
          autoFocus
        />
        <Input
          label="Dirección *"
          placeholder="Calle, número..."
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />
        <Input
          label="Municipio"
          placeholder="Ej: Palma de Mallorca"
          value={form.municipio}
          onChange={(e) => setForm({ ...form, municipio: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Código postal"
            placeholder="07001"
            value={form.cp}
            onChange={(e) => setForm({ ...form, cp: e.target.value })}
          />
          <Input
            label="Teléfono"
            placeholder="+34 600..."
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ej: código llave, acceso, observaciones..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Ubicación (para rutas)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitud"
              type="number"
              step="any"
              placeholder="39.5696"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              placeholder="2.6502"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleGeocode}
            disabled={geocoding || !(form.street || form.municipio || form.cp)}
            loading={geocoding}
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Geocodificar desde dirección
          </Button>
        </div>

        <OwnerSelector value={owner} onChange={setOwner} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Crear casa
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function HouseAvatar({ house }) {
  const [error, setError] = useState(false);
  const src = house.houseImage?.thumbnail || house.houseImage?.original;
  const initials = (house.houseName || '?').slice(0, 2).toUpperCase();
  if (src && !error) {
    return (
      <img
        src={src}
        alt=""
        className="w-9 h-9 rounded-lg object-cover bg-stone-100 flex-shrink-0"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-turquoise-600) 100%)' }}
    >
      {initials}
    </div>
  );
}

function formatRelative(date) {
  if (!date) return '—';
  if (isToday(date)) return `hoy ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return 'ayer';
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: es });
}

export default function HousesPage() {
  const { company } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: houses = [], isLoading } = useHouses();
  const { data: incidences = [] } = useIncidences();
  const { data: jobs = [] } = useJobs();
  const { data: checklists = [] } = useChecklists();
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const openHouseId = location.state?.openHouseId;
    if (!openHouseId || houses.length === 0) return;
    const house = houses.find((h) => h.id === openHouseId);
    if (house) {
      setSelectedHouse(house);
      navigate('/casas', { replace: true, state: {} });
    }
  }, [location.state?.openHouseId, houses, navigate]);

  const stats = useMemo(() => {
    const map = new Map();
    houses.forEach((h) => {
      map.set(h.id, { openIncidences: 0, activeJobs: 0, lastActivity: null, qualitySum: 0, qualityCount: 0 });
    });
    incidences.forEach((inc) => {
      const id = getIncidenceHouseId(inc);
      const s = map.get(id);
      if (!s) return;
      if (!inc.done) s.openIncidences += 1;
      const d = toDate(inc.date || inc.createdAt);
      if (d && (!s.lastActivity || d > s.lastActivity)) s.lastActivity = d;
    });
    jobs.forEach((job) => {
      const s = map.get(job.houseId);
      if (!s) return;
      if (job.status !== 'completed') s.activeJobs += 1;
      const d = toDate(job.createdAt);
      if (d && (!s.lastActivity || d > s.lastActivity)) s.lastActivity = d;
    });
    checklists.forEach((cl) => {
      const s = map.get(cl.houseId);
      if (!s) return;
      const total = cl.total ?? 0;
      const done = cl.done ?? 0;
      if (total > 0) {
        s.qualitySum += (done / total) * 100;
        s.qualityCount += 1;
      }
      const d = toDate(cl.date);
      if (d && (!s.lastActivity || d > s.lastActivity)) s.lastActivity = d;
    });
    return map;
  }, [houses, incidences, jobs, checklists]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return houses;
    return houses.filter((h) => {
      const ownerName = h.owner ? `${h.owner.firstName ?? ''} ${h.owner.lastName ?? ''}` : '';
      return [h.houseName, h.street, h.municipio, ownerName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [houses, search]);

  const columns = useMemo(
    () => [
      {
        key: 'house',
        label: 'Casa',
        sortable: true,
        sortAccessor: (h) => h.houseName || '',
        render: (h) => (
          <div className="flex items-center gap-3 min-w-0">
            <HouseAvatar house={h} />
            <div className="min-w-0">
              <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                {h.houseName || 'Sin nombre'}
              </p>
              {(h.street || h.municipio) && (
                <p className="text-xs text-stone-500 truncate">
                  {[h.street, h.municipio].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'owner',
        label: 'Propietario',
        sortable: true,
        sortAccessor: (h) => `${h.owner?.firstName ?? ''} ${h.owner?.lastName ?? ''}`.trim() || 'zzz',
        render: (h) =>
          h.owner ? (
            <span className="text-stone-700 dark:text-stone-200">
              {h.owner.firstName} {h.owner.lastName}
            </span>
          ) : (
            <span className="text-stone-400">—</span>
          ),
      },
      {
        key: 'incidences',
        label: 'Pendientes',
        sortable: true,
        sortAccessor: (h) => stats.get(h.id)?.openIncidences ?? 0,
        render: (h) => {
          const n = stats.get(h.id)?.openIncidences ?? 0;
          if (n === 0) return <span className="text-stone-400">Ninguno</span>;
          return <Pill variant={n > 1 ? 'high' : 'medium'} dot>{n} {n === 1 ? 'pendiente' : 'pendientes'}</Pill>;
        },
      },
      {
        key: 'jobs',
        label: 'Trabajos activos',
        sortable: true,
        align: 'right',
        sortAccessor: (h) => stats.get(h.id)?.activeJobs ?? 0,
        render: (h) => {
          const n = stats.get(h.id)?.activeJobs ?? 0;
          return <span className={`font-mono tabular-nums ${n === 0 ? 'text-stone-400' : 'text-stone-700 dark:text-stone-200'}`}>{n}</span>;
        },
      },
      {
        key: 'quality',
        label: 'Calidad',
        sortable: true,
        sortAccessor: (h) => {
          const s = stats.get(h.id);
          return s && s.qualityCount > 0 ? s.qualitySum / s.qualityCount : -1;
        },
        render: (h) => {
          const s = stats.get(h.id);
          if (!s || s.qualityCount === 0) return <span className="text-stone-400 text-xs">Sin datos</span>;
          return <QualityBar value={s.qualitySum / s.qualityCount} />;
        },
      },
      {
        key: 'last',
        label: 'Última',
        sortable: true,
        align: 'right',
        sortAccessor: (h) => stats.get(h.id)?.lastActivity?.getTime() ?? 0,
        render: (h) => (
          <span className="font-mono tabular-nums text-xs text-stone-500">
            {formatRelative(stats.get(h.id)?.lastActivity)}
          </span>
        ),
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Gestión', 'Casas']}
        title="Casas"
        subtitle={
          isLoading
            ? 'Cargando…'
            : `${houses.length} ${houses.length === 1 ? 'propiedad' : 'propiedades'} gestionadas`
        }
        actions={
          <>
            <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-0.5">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium transition ${
                  view === 'list'
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Rows3 className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium transition ${
                  view === 'grid'
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cuadrícula
              </button>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Nueva casa
            </Button>
          </>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, propietario o ubicación…"
      />

      {isLoading ? (
        <Card className="py-16 text-center text-stone-500">Cargando casas…</Card>
      ) : view === 'list' ? (
        <Card className="overflow-hidden p-0">
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(h) => h.id}
            onRowClick={(h) => navigate(`/casas/${h.id}`)}
            selectedRowKey={selectedHouse?.id}
            initialSort={{ key: 'house', dir: 'asc' }}
            emptyState={
              <EmptyState
                icon={Home}
                title={search ? 'Sin resultados' : 'No hay casas registradas'}
                description={
                  search
                    ? 'Prueba con otros términos de búsqueda.'
                    : 'Añade la primera propiedad desde el botón superior.'
                }
              />
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((house) => (
            <Card
              key={house.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/casas/${house.id}`)}
            >
              <HouseImage src={house.houseImage?.original} size="lg" />
              <div className="p-4">
                <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {house.houseName || 'Sin nombre'}
                </p>
                {(house.street || house.municipio) && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {[house.street, house.municipio].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {house.owner && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-500">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {house.owner.firstName} {house.owner.lastName}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedHouse && (
        <HouseDetailPanel
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
          onOpenChecklist={setSelectedChecklist}
        />
      )}

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}

      <CreateHouseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
