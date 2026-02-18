import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import {
  useHouses,
  useUpdateHouse,
  useCreateHouse,
  useUploadHouseImage,
  useOwners,
} from '@/hooks/useFirestore';
import { Home, X, MapPin, User, Save, Plus, Camera, ChevronDown, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

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
          alt="Port Management"
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

function HouseDetailPanel({ house, onClose }) {
  const updateHouse = useUpdateHouse();
  const [form, setForm] = useState({
    houseName: house.houseName || '',
    street: house.street || '',
    municipio: house.municipio || '',
  });
  const [saving, setSaving] = useState(false);

  const ownerName = house.owner
    ? `${house.owner.firstName || ''} ${house.owner.lastName || ''}`.trim()
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHouse.mutateAsync({ id: house.id, ...form });
      onClose();
    } catch (e) {
      console.error('Error updating house', e);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    form.houseName !== (house.houseName || '') ||
    form.street !== (house.street || '') ||
    form.municipio !== (house.municipio || '');

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ficha de casa</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Imagen */}
          <HouseImage
            src={house.houseImage?.original}
            size="lg"
          />

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
          </div>

          {/* Propietario */}
          {ownerName && (
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Propietario</p>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#126D9B]/10">
                  <User className="w-4 h-4 text-[#126D9B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ownerName}
                  </p>
                  {house.owner?.phone && (
                    <p className="text-xs text-gray-500">{house.owner.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}
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
  });
  const [owner, setOwner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = form.houseName.trim() && form.street.trim();

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ houseName: '', street: '', municipio: '', cp: '', phone: '' });
    setOwner(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const houseData = { ...form };
      if (owner) houseData.owner = owner;

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

export default function HousesPage() {
  const { data: houses = [], isLoading } = useHouses();
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casas</h1>
          <p className="text-gray-500">
            Propiedades o viviendas gestionadas en el sistema
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva casa
        </Button>
      </div>

      {!isLoading && houses.length > 0 && (
        <p className="text-sm text-gray-500">
          {houses.length} casas registradas
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : houses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay casas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((house) => (
            <Card
              key={house.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedHouse(house)}
            >
              {/* Foto */}
              <HouseImage src={house.houseImage?.original} size="lg" />

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-gray-900 truncate">
                  {house.houseName || 'Sin nombre'}
                </p>
                {(house.street || house.municipio) && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {[house.street, house.municipio]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {house.owner && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
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

      {/* Sidebar de detalle */}
      {selectedHouse && (
        <HouseDetailPanel
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
        />
      )}

      {/* Modal crear casa */}
      <CreateHouseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
