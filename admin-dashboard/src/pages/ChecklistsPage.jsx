import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useChecklistsPaginated, useHouses, useChecksCatalog, useCreateChecklist, useWorkersFirestore } from '@/hooks/useFirestore';
import {
  CheckSquare,
  Home,
  Loader2,
  Plus,
  User,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import { DataTable } from '@/components/ui/DataTable';
import { Pill } from '@/components/ui/Pill';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar, FilterChip } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { QualityBar } from '@/components/ui/QualityBar';

function toDate(value) {
  if (!value) return null;
  try {
    let d;
    if (value.toDate && typeof value.toDate === 'function') d = value.toDate();
    else if (value.seconds) d = new Date(value.seconds * 1000);
    else if (value._d) d = value._d;
    else d = new Date(value);
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  } catch {
    return null;
  }
}

function formatChecklistDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, 'd MMM yyyy', { locale: es });
}

function getHouseName(checklist) {
  return checklist.house?.[0]?.houseName || checklist.houseName || 'Sin casa';
}

function generateMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: format(d, 'MMMM yyyy', { locale: es }),
    });
  }
  return options;
}

export default function ChecklistsPage() {
  const [filterFinished, setFilterFinished] = useState(undefined);
  const [filterHouseId, setFilterHouseId] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const sentinelRef = useRef(null);

  const serverFilters = useMemo(() => {
    const f = {};
    if (filterFinished !== undefined) f.finished = filterFinished;
    if (filterHouseId) f.houseId = filterHouseId;
    if (filterMonth) {
      const [year, month] = filterMonth.split('-').map(Number);
      f.dateFrom = endOfMonth(new Date(year, month - 1));
      f.dateTo = startOfMonth(new Date(year, month - 1));
    }
    return f;
  }, [filterFinished, filterHouseId, filterMonth]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useChecklistsPaginated(serverFilters);

  const { data: houses = [] } = useHouses();
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const checklists = useMemo(
    () => data?.pages?.flatMap((p) => p.docs) ?? [],
    [data],
  );

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleObserver]);

  const hasActiveFilters = filterHouseId || filterMonth;

  const clearFilters = () => {
    setFilterHouseId('');
    setFilterMonth('');
    setFilterFinished(undefined);
  };

  const columns = useMemo(
    () => [
      {
        key: 'house',
        label: 'Casa',
        sortable: true,
        sortAccessor: (cl) => getHouseName(cl),
        render: (cl) => {
          const name = getHouseName(cl);
          const hid = cl.houseId || cl.house?.[0]?.id || cl.house?.id;
          return (
            <div className="min-w-0 flex items-center gap-2">
              <Home className="w-4 h-4 text-stone-400 flex-shrink-0" />
              {hid ? (
                <Link
                  to={`/casas/${hid}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-stone-900 dark:text-stone-100 hover:text-turquoise-700 dark:hover:text-turquoise-300 truncate"
                >
                  {name}
                </Link>
              ) : (
                <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{name}</span>
              )}
            </div>
          );
        },
      },
      {
        key: 'progress',
        label: 'Puntos',
        sortable: true,
        sortAccessor: (cl) => (cl.total > 0 ? (cl.done || 0) / cl.total : 0),
        render: (cl) => {
          if (!cl.total) return <span className="text-stone-400 text-xs">—</span>;
          const pct = (Math.min(cl.done || 0, cl.total) / cl.total) * 100;
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums text-xs text-stone-700 dark:text-stone-200">
                {Math.min(cl.done || 0, cl.total)}/{cl.total}
              </span>
              <QualityBar value={pct} showValue={false} />
            </div>
          );
        },
      },
      {
        key: 'workers',
        label: 'Trabajadores',
        render: (cl) => {
          const ws = cl.workers || [];
          if (ws.length === 0) return <span className="text-stone-400 text-xs">—</span>;
          return (
            <div className="flex items-center -space-x-1.5">
              {ws.slice(0, 3).map((w, i) => (
                <span
                  key={w.id || i}
                  title={`${w.firstName || ''} ${w.lastName || ''}`.trim()}
                  className="w-6 h-6 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--surface-elevated)]"
                >
                  {(w.firstName || '?').charAt(0).toUpperCase()}
                </span>
              ))}
              {ws.length > 3 && <span className="ml-2 text-xs text-stone-500">+{ws.length - 3}</span>}
            </div>
          );
        },
      },
      {
        key: 'state',
        label: 'Estado',
        sortable: true,
        sortAccessor: (cl) => (cl.finished ? 1 : 0),
        render: (cl) =>
          cl.finished ? <Pill variant="resolved">Finalizada</Pill> : <Pill variant="info">En curso</Pill>,
      },
      {
        key: 'date',
        label: 'Fecha',
        sortable: true,
        align: 'right',
        sortAccessor: (cl) => toDate(cl.date)?.getTime() ?? 0,
        render: (cl) => (
          <span className="font-mono tabular-nums text-xs text-stone-500">
            {formatChecklistDate(cl.date)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Operaciones', 'Revisiones']}
        title="Revisiones"
        subtitle={
          isLoading
            ? 'Cargando…'
            : `${checklists.length} ${checklists.length === 1 ? 'revisión' : 'revisiones'}${hasNextPage ? ' cargadas' : ''}`
        }
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva revisión
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filterFinished === undefined} onClick={() => setFilterFinished(undefined)}>
          Todas
        </FilterChip>
        <FilterChip active={filterFinished === false} onClick={() => setFilterFinished(false)}>
          En curso
        </FilterChip>
        <FilterChip active={filterFinished === true} onClick={() => setFilterFinished(true)}>
          Finalizadas
        </FilterChip>
      </div>

      <FilterBar
        right={
          <>
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
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500/30"
            >
              <option value="">Todos los meses</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-turquoise-600 hover:underline"
              >
                Limpiar
              </button>
            )}
          </>
        }
      />

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          Error al cargar revisiones: {error?.message || 'Error desconocido'}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando…
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={checklists}
            getRowKey={(cl) => cl.id}
            onRowClick={(cl) => setSelectedChecklist(cl)}
            selectedRowKey={selectedChecklist?.id}
            initialSort={{ key: 'date', dir: 'desc' }}
            emptyState={
              <EmptyState
                icon={CheckSquare}
                title={hasActiveFilters ? 'Sin revisiones con estos filtros' : 'No hay revisiones'}
                description={
                  hasActiveFilters
                    ? 'Prueba a cambiar los filtros para ampliar la búsqueda.'
                    : 'Crea la primera revisión desde el botón superior.'
                }
              />
            }
          />
        )}
      </Card>

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4 text-stone-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando más…
        </div>
      )}

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}

      {showCreateModal && (
        <CreateRevisionModal
          houses={houses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function CreateRevisionModal({ houses, onClose, onCreated }) {
  const { data: checkTemplates = [] } = useChecksCatalog();
  const { data: workers = [] } = useWorkersFirestore();
  const createChecklist = useCreateChecklist();
  const [houseId, setHouseId] = useState('');
  const [dateValue, setDateValue] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [observations, setObservations] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState(new Set());
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());

  const house = houses.find((h) => h.id === houseId);
  const selectedTemplates = checkTemplates.filter((t) => selectedTemplateIds.has(t.id));
  const selectedWorkers = workers.filter((w) => selectedWorkerIds.has(w.id));
  const canSubmit = houseId && dateValue && selectedTemplates.length > 0;

  const toggleTemplate = (id) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllTemplates = () => {
    if (selectedTemplateIds.size === checkTemplates.length) setSelectedTemplateIds(new Set());
    else setSelectedTemplateIds(new Set(checkTemplates.map((t) => t.id)));
  };

  const toggleWorker = (id) => {
    setSelectedWorkerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllWorkers = () => {
    if (selectedWorkerIds.size === workers.length) setSelectedWorkerIds(new Set());
    else setSelectedWorkerIds(new Set(workers.map((w) => w.id)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createChecklist.mutateAsync({
        houseId: house.id,
        house: house,
        date: new Date(dateValue),
        observations: observations.trim() || undefined,
        workers: selectedWorkers.length > 0 ? selectedWorkers : undefined,
        workersId: selectedWorkers.length > 0 ? selectedWorkers.map((w) => w.id) : undefined,
        selectedTemplates: selectedTemplates,
      });
      onCreated();
    } catch (err) {
      console.error('Error creating checklist', err);
    }
  };

  return (
    <Modal open onClose={onClose} title="Nueva revisión">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Casa *</label>
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas para esta revisión..."
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Puntos de la revisión *</label>
            <button
              type="button"
              onClick={selectAllTemplates}
              className="text-xs text-[#126D9B] hover:underline"
            >
              {selectedTemplateIds.size === checkTemplates.length ? 'Quitar todos' : 'Seleccionar todos'}
            </button>
          </div>
          {checkTemplates.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              No hay puntos en el catálogo. Añade alguno en Configuración → Catálogo de Checks.
            </p>
          ) : (
            <ul className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {checkTemplates.map((t) => (
                <li key={t.id}>
                  <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTemplateIds.has(t.id)}
                      onChange={() => toggleTemplate(t.id)}
                      className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]"
                    />
                    <span className="text-sm text-gray-900">{t.nameEs || t.name || t.nameEn || '—'}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {selectedTemplates.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{selectedTemplates.length} punto(s) seleccionado(s)</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Trabajadores (opcional)
            </label>
            {workers.length > 0 && (
              <button
                type="button"
                onClick={selectAllWorkers}
                className="text-xs text-[#126D9B] hover:underline"
              >
                {selectedWorkerIds.size === workers.length ? 'Quitar todos' : 'Seleccionar todos'}
              </button>
            )}
          </div>
          {workers.length === 0 ? (
            <p className="text-sm text-gray-500 rounded-lg px-3 py-2 bg-gray-50">
              No hay trabajadores. Asígnelos desde Trabajadores.
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {workers.map((w) => {
                const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email || 'Sin nombre';
                return (
                  <li key={w.id}>
                    <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWorkerIds.has(w.id)}
                        onChange={() => toggleWorker(w.id)}
                        className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]"
                      />
                      <span className="text-sm text-gray-900">{name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedWorkers.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{selectedWorkers.length} trabajador(es) seleccionado(s)</p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit || createChecklist.isPending}>
            {createChecklist.isPending ? 'Creando…' : 'Crear revisión'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
