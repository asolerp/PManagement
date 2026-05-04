import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useWorkersFirestore,
  useUpdateUser,
  useCreateUser,
} from '@/hooks/useFirestore';
import {
  Mail,
  Phone,
  User,
  Users,
  Plus,
  X,
  Save,
  Globe,
  Pencil,
  MapPin,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { geocodeAddress, toLocationObject } from '@/utils/geocoding';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';

function WorkerAvatar({ photo, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  const sizes = {
    md: 'w-9 h-9 sm:w-12 sm:h-12 text-sm sm:text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  if (!photo || imgError) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center flex-shrink-0`}
      >
        <span className="font-semibold text-white">{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gray-200 flex-shrink-0 overflow-hidden`}
    >
      <img
        src={photo}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function getWorkerPhoto(worker) {
  let raw = null;
  if (typeof worker.profileImage === 'object' && worker.profileImage) {
    raw = worker.profileImage.small || worker.profileImage.original || null;
  } else if (typeof worker.profileImage === 'string') {
    raw = worker.profileImage;
  } else {
    raw = worker.photoURL || worker.photo || null;
  }
  return getSafeImageUrl(raw);
}

function WorkerDetailPanel({ worker, onClose }) {
  const updateUser = useUpdateUser();
  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim();
  const photo = getWorkerPhoto(worker);

  const initialForm = useMemo(
    () => ({
      firstName: worker.firstName || '',
      lastName: worker.lastName || '',
      email: worker.email || '',
      phone: worker.phone || '',
      language: worker.language || 'es',
      homeAddress: worker.homeAddress || '',
      homeLatitude: worker.homeLocation?.latitude ?? '',
      homeLongitude: worker.homeLocation?.longitude ?? '',
      telegramId: worker.telegramId || '',
    }),
    [worker.id]
  );
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const hasChanges =
    form.firstName !== (worker.firstName || '') ||
    form.lastName !== (worker.lastName || '') ||
    form.phone !== (worker.phone || '') ||
    form.language !== (worker.language || 'es') ||
    form.homeAddress !== (worker.homeAddress || '') ||
    form.telegramId !== (worker.telegramId || '') ||
    String(form.homeLatitude ?? '') !== String(worker.homeLocation?.latitude ?? '') ||
    String(form.homeLongitude ?? '') !== String(worker.homeLocation?.longitude ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { id: worker.id, firstName: form.firstName, lastName: form.lastName, phone: form.phone, language: form.language, homeAddress: form.homeAddress?.trim() || null, telegramId: form.telegramId?.trim() || null };
      const homeLocation = toLocationObject({ latitude: form.homeLatitude, longitude: form.homeLongitude });
      payload.homeLocation = homeLocation ?? (worker.homeLocation ? null : undefined);
      if (payload.homeLocation === undefined) delete payload.homeLocation;
      await updateUser.mutateAsync(payload);
      onClose();
    } catch (e) {
      console.error('Error updating worker', e);
    } finally {
      setSaving(false);
    }
  };

  const handleGeocodeHome = async () => {
    if (!form.homeAddress?.trim()) return;
    setGeocoding(true);
    try {
      const coords = await geocodeAddress(form.homeAddress.trim());
      if (coords) setForm((f) => ({ ...f, homeLatitude: coords.latitude, homeLongitude: coords.longitude }));
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ficha de trabajador
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar + nombre */}
          <div className="flex items-center gap-4">
            <WorkerAvatar photo={photo} name={fullName} size="lg" />
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {fullName || 'Sin nombre'}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Trabajador
              </span>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
              <Input
                label="Apellidos"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>
            <Input
              label="Email"
              value={form.email}
              disabled
              className="bg-gray-50"
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div>
              <Input
                label="ID de Telegram"
                placeholder="Para consultas por bot"
                value={form.telegramId}
                onChange={(e) => setForm({ ...form, telegramId: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-0.5">El trabajador obtiene su ID escribiendo al bot en Telegram.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="ca">Català</option>
              </select>
            </div>

            {/* Punto de partida (para rutas) */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Punto de partida (para rutas)
              </p>
              <Input
                label="Domicilio / dirección de salida"
                placeholder="Calle, ciudad, CP..."
                value={form.homeAddress}
                onChange={(e) =>
                  setForm({ ...form, homeAddress: e.target.value })
                }
                className="mb-3"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitud"
                  type="number"
                  step="any"
                  placeholder="39.5696"
                  value={form.homeLatitude}
                  onChange={(e) =>
                    setForm({ ...form, homeLatitude: e.target.value })
                  }
                />
                <Input
                  label="Longitud"
                  type="number"
                  step="any"
                  placeholder="2.6502"
                  value={form.homeLongitude}
                  onChange={(e) =>
                    setForm({ ...form, homeLongitude: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleGeocodeHome}
                disabled={geocoding || !form.homeAddress?.trim()}
                loading={geocoding}
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Geocodificar desde dirección
              </Button>
            </div>
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

function CreateWorkerModal({ open, onClose }) {
  const createUser = useCreateUser();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'es',
    gender: 'male',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    form.firstName.trim() && form.lastName.trim() && form.email.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      await createUser.mutateAsync({ ...form, role: 'worker' });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        language: 'es',
        gender: 'male',
      });
      onClose();
    } catch (err) {
      console.error('Error creating worker', err);
      setError('Comprueba que el email es correcto y no está en uso');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo trabajador">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            placeholder="Nombre"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            autoFocus
          />
          <Input
            label="Apellidos *"
            placeholder="Apellidos"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <Input
          label="Email *"
          type="email"
          placeholder="email@ejemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Teléfono"
          placeholder="+34 600 000 000"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <select
              value={form.language}
              onChange={(e) =>
                setForm({ ...form, language: e.target.value })
              }
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Crear trabajador
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function WorkersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workers = [], isLoading } = useWorkersFirestore();
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const openId = location.state?.openWorkerId;
    if (openId && workers.length > 0) {
      const w = workers.find((x) => x.id === openId);
      if (w) setSelectedWorker(w);
    }
  }, [location.state?.openWorkerId, workers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter((w) => {
      const name = `${w.firstName ?? ''} ${w.lastName ?? ''}`.toLowerCase();
      return name.includes(q) || (w.email ?? '').toLowerCase().includes(q) || (w.phone ?? '').includes(q);
    });
  }, [workers, search]);

  const columns = useMemo(
    () => [
      {
        key: 'worker',
        label: 'Trabajador',
        sortable: true,
        sortAccessor: (w) => `${w.firstName ?? ''} ${w.lastName ?? ''}`.trim(),
        render: (w) => {
          const fullName = `${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Sin nombre';
          return (
            <div className="flex items-center gap-3 min-w-0">
              <WorkerAvatar photo={getWorkerPhoto(w)} name={fullName} size="md" />
              <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{fullName}</span>
            </div>
          );
        },
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        render: (w) =>
          w.email ? (
            <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 truncate">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span className="truncate">{w.email}</span>
            </span>
          ) : (
            <span className="text-stone-400">—</span>
          ),
      },
      {
        key: 'phone',
        label: 'Teléfono',
        render: (w) =>
          w.phone ? (
            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-stone-600 dark:text-stone-300">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              {w.phone}
            </span>
          ) : (
            <span className="text-stone-400">—</span>
          ),
      },
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (w) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWorker(w);
            }}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title="Editar perfil"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Gestión', 'Trabajadores']}
        title="Trabajadores"
        subtitle={
          isLoading
            ? 'Cargando…'
            : `${workers.length} ${workers.length === 1 ? 'trabajador registrado' : 'trabajadores registrados'}`
        }
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo trabajador
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, email o teléfono…"
      />

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500">Cargando…</div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(w) => w.id}
            onRowClick={(w) => navigate(`/trabajadores/${w.id}`)}
            initialSort={{ key: 'worker', dir: 'asc' }}
            emptyState={
              <EmptyState
                icon={Users}
                title={search ? 'Sin resultados' : 'No hay trabajadores'}
                description={search ? 'Prueba con otros términos.' : 'Añade trabajadores desde el botón superior.'}
              />
            }
          />
        )}
      </Card>

      {selectedWorker && (
        <WorkerDetailPanel
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}

      <CreateWorkerModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
