import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useIncidences, useHouses, useCreateIncidence, useWorkersFirestore, useSettings } from '@/hooks/useFirestore';
import { uploadIncidencePhoto } from '@/services/firestore';
import { useAuth } from '@/hooks/useAuth';
import IncidenceDetailPanel from '@/components/IncidenceDetailPanel';
import {
  AlertCircle,
  AlertTriangle,
  Home,
  Camera,
  Plus,
  Hourglass,
  UserX,
} from 'lucide-react';
import { format, formatDistanceToNowStrict, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { getIncidenceSlaStatus, getIncidenceStaleInfo } from '@/utils/sla';
import { DataTable } from '@/components/ui/DataTable';
import { Pill } from '@/components/ui/Pill';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar, FilterChip } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';

const PRIORITY_VARIANT = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};
const PRIORITY_LABEL = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

function toJsDate(value) {
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

function relativeWhen(value) {
  const d = toJsDate(value);
  if (!d) return '—';
  if (isToday(d)) return `hoy ${format(d, 'HH:mm')}`;
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: es });
}


export default function IncidencesPage() {
  const [filterDone, setFilterDone] = useState(undefined);
  const [filterSlaRisk, setFilterSlaRisk] = useState(false);
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [filterStale, setFilterStale] = useState(false);
  const [filterHouseId, setFilterHouseId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: incidences = [], isLoading } = useIncidences({
    ...(filterDone !== undefined && { done: filterDone }),
  });
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const { data: houses = [] } = useHouses();
  const { data: allWorkers = [] } = useWorkersFirestore();
  const openIncidencesForSuggestion = useMemo(
    () => incidences.filter((inc) => !inc.done),
    [incidences]
  );

  const filteredIncidences = useMemo(() => {
    let list = incidences;
    if (filterSlaRisk) {
      list = list.filter((inc) => {
        const sla = getIncidenceSlaStatus(inc);
        return sla && (sla.status === 'at_risk' || sla.status === 'breached');
      });
    }
    if (filterUnassigned) {
      list = list.filter((inc) => {
        const hasWorkers = (inc.workersId && inc.workersId.length > 0) || (inc.workers && inc.workers.length > 0);
        return !hasWorkers;
      });
    }
    if (filterStale) {
      list = list.filter((inc) => getIncidenceStaleInfo(inc)?.isStale === true);
    }
    if (filterHouseId) {
      list = list.filter((inc) => {
        const hid = inc.houseId || inc.house?.id || inc.house?.[0]?.id;
        return hid === filterHouseId;
      });
    }
    return list;
  }, [incidences, filterSlaRisk, filterUnassigned, filterStale, filterHouseId]);

  const hasQuickFilters = filterSlaRisk || filterUnassigned || filterStale || !!filterHouseId;

  const counts = useMemo(() => {
    const total = incidences.length;
    const open = incidences.filter((i) => !i.done).length;
    const closed = total - open;
    const critical = incidences.filter((i) => !i.done && i.priority === 'critical').length;
    const unassigned = incidences.filter((i) => {
      const has = (i.workersId && i.workersId.length > 0) || (i.workers && i.workers.length > 0);
      return !i.done && !has;
    }).length;
    return { total, open, closed, critical, unassigned };
  }, [incidences]);

  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Incidencia',
        sortable: true,
        sortAccessor: (i) => i.title || i.description || '',
        render: (i) => (
          <div className="min-w-0">
            <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {i.title || i.description?.slice(0, 60) || 'Sin título'}
            </p>
            <p className="text-[11px] text-stone-400 font-mono tabular-nums truncate">
              {i.id?.slice(0, 8)}
              {i.photos?.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                  <Camera className="w-3 h-3" />
                  {i.photos.length}
                </span>
              )}
            </p>
          </div>
        ),
      },
      {
        key: 'house',
        label: 'Casa',
        sortable: true,
        sortAccessor: (i) => i.house?.houseName || i.house?.[0]?.houseName || '',
        render: (i) => {
          const hid = i.houseId || i.house?.id || i.house?.[0]?.id;
          const name = i.house?.houseName || i.house?.[0]?.houseName || 'Casa';
          if (!hid) return <span className="text-stone-400">—</span>;
          return (
            <Link
              to={`/casas/${hid}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-200 hover:text-turquoise-700 dark:hover:text-turquoise-300 transition-colors truncate"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span className="truncate">{name}</span>
            </Link>
          );
        },
      },
      {
        key: 'priority',
        label: 'Prioridad',
        sortable: true,
        sortAccessor: (i) => ({ critical: 0, high: 1, medium: 2, low: 3 }[i.priority] ?? 4),
        render: (i) => {
          if (!i.priority) return <span className="text-stone-400 text-xs">—</span>;
          return (
            <Pill variant={PRIORITY_VARIANT[i.priority] ?? 'neutral'} dot>
              {PRIORITY_LABEL[i.priority] ?? i.priority}
            </Pill>
          );
        },
      },
      {
        key: 'state',
        label: 'Estado',
        sortable: true,
        sortAccessor: (i) => (i.done ? 2 : i.state === 'in_progress' ? 1 : 0),
        render: (i) => {
          if (i.done) return <Pill variant="resolved">Resuelta</Pill>;
          if (i.state === 'in_progress') return <Pill variant="info">En curso</Pill>;
          return <Pill variant="neutral">Abierta</Pill>;
        },
      },
      {
        key: 'assigned',
        label: 'Asignado',
        render: (i) => {
          const workers = i.workers || [];
          if (workers.length === 0) {
            return <span className="text-stone-400 text-xs">Sin asignar</span>;
          }
          const first = workers[0];
          const name = `${first.firstName || ''} ${first.lastName || ''}`.trim() || 'Trabajador';
          return (
            <span className="inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-200">
              <span className="w-5 h-5 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center">
                {(first.firstName || '?').charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{name}{workers.length > 1 && ` +${workers.length - 1}`}</span>
            </span>
          );
        },
      },
      {
        key: 'when',
        label: 'Cuándo',
        sortable: true,
        align: 'right',
        sortAccessor: (i) => toJsDate(i.date || i.createdAt)?.getTime() ?? 0,
        render: (i) => (
          <span className="font-mono tabular-nums text-xs text-stone-500">
            {relativeWhen(i.date || i.createdAt)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Operaciones', 'Incidencias']}
        title="Incidencias"
        subtitle={
          isLoading
            ? 'Cargando…'
            : `${counts.open} abiertas · ${counts.critical} críticas · ${counts.closed} resueltas`
        }
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva incidencia
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filterDone === undefined} onClick={() => setFilterDone(undefined)} count={counts.total}>
          Todas
        </FilterChip>
        <FilterChip active={filterDone === false} onClick={() => setFilterDone(false)} count={counts.open}>
          Abiertas
        </FilterChip>
        <FilterChip
          active={filterUnassigned}
          onClick={() => setFilterUnassigned((v) => !v)}
          count={counts.unassigned}
        >
          <UserX className="w-3.5 h-3.5" />
          Sin asignar
        </FilterChip>
        <FilterChip
          active={filterSlaRisk}
          onClick={() => setFilterSlaRisk((v) => !v)}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Plazo en riesgo
        </FilterChip>
        <FilterChip
          active={filterStale}
          onClick={() => setFilterStale((v) => !v)}
        >
          <Hourglass className="w-3.5 h-3.5" />
          Estancadas
        </FilterChip>
        <FilterChip active={filterDone === true} onClick={() => setFilterDone(true)} count={counts.closed}>
          Resueltas
        </FilterChip>
      </div>

      <FilterBar
        right={
          <select
            value={filterHouseId}
            onChange={(e) => setFilterHouseId(e.target.value)}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500/30"
          >
            <option value="">Todas las casas</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.houseName || 'Sin nombre'}
              </option>
            ))}
          </select>
        }
      >
        {hasQuickFilters && (
          <button
            type="button"
            onClick={() => {
              setFilterSlaRisk(false);
              setFilterUnassigned(false);
              setFilterStale(false);
              setFilterHouseId('');
            }}
            className="text-xs text-turquoise-600 hover:underline"
          >
            Quitar filtros
          </button>
        )}
      </FilterBar>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500">Cargando incidencias…</div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredIncidences}
            getRowKey={(i) => i.id}
            onRowClick={(i) => setSelectedIncidence(i)}
            selectedRowKey={selectedIncidence?.id}
            initialSort={{ key: 'when', dir: 'desc' }}
            emptyState={
              <EmptyState
                icon={AlertCircle}
                title={hasQuickFilters ? 'Sin resultados con estos filtros' : 'No hay incidencias'}
                description={
                  hasQuickFilters
                    ? 'Prueba a ajustar los filtros para ampliar la búsqueda.'
                    : 'Las incidencias aparecerán aquí cuando se creen.'
                }
              />
            }
          />
        )}
      </Card>

      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allOpenIncidences={openIncidencesForSuggestion}
          allWorkers={allWorkers}
          allHouses={houses}
        />
      )}

      {showCreateModal && (
        <CreateIncidenceModal
          houses={houses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function CreateIncidenceModal({ houses, onClose, onCreated }) {
  const createIncidence = useCreateIncidence();
  const { user, userData } = useAuth();
  const { data: settings } = useSettings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [houseId, setHouseId] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const house = houses.find((h) => h.id === houseId);
  const canSubmit = title.trim() && houseId;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...photoFiles, ...files].slice(0, 8);
    setPhotoFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setUploading(true);
      const photoUrls = await Promise.all(photoFiles.map((f) => uploadIncidencePhoto(f)));
      await createIncidence.mutateAsync({
        title: title.trim(),
        incidence: description.trim() || undefined,
        houseId: house.id,
        house: house,
        priority: priority || undefined,
        category: category || undefined,
        photos: photoUrls,
        createdBy: user && userData ? { uid: user.uid, email: userData.email || '' } : undefined,
        slaResponseHours: settings?.slaIncidenceResponseHours ?? 24,
        slaResolutionHours: settings?.slaIncidenceResolutionHours ?? 72,
      });
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      onCreated();
    } catch (err) {
      console.error('Error creating incidence', err);
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = uploading || createIncidence.isPending;

  return (
    <Modal open onClose={onClose} title="Nueva incidencia">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Título *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fuga de agua en baño"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles de la incidencia..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            required
          >
            <option value="">Seleccionar propiedad</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.houseName || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            >
              <option value="">Sin prioridad</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              <option value="safety">Seguridad</option>
              <option value="cleanliness">Limpieza</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="amenities">Equipamiento</option>
              <option value="cosmetic">Estético</option>
            </select>
          </div>
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos <span className="text-gray-400 font-normal">(máx. 8)</span>
          </label>
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {photoPreviews.map((src, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photoFiles.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-turquoise-400 hover:text-turquoise-500 transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          )}
          {photoPreviews.length === 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 flex flex-col items-center gap-1 text-gray-400 hover:border-turquoise-400 hover:text-turquoise-500 transition-colors"
            >
              <Camera size={22} />
              <span className="text-xs">Añadir fotos</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {uploading ? `Subiendo fotos… (${photoFiles.length})` : isSubmitting ? 'Creando…' : 'Crear incidencia'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
