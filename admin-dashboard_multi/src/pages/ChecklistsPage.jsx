import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useChecklistsPaginated, useHouses, useChecksCatalog, useCreateChecklist, useWorkersFirestore } from '@/hooks/useFirestore';
import {
  CheckSquare,
  CheckCircle,
  Home,
  CalendarDays,
  X,
  ChevronDown,
  Loader2,
  Plus,
  User,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';

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
  const [showHouseDropdown, setShowHouseDropdown] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const sentinelRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setShowHouseDropdown(false);
  }, [location.pathname]);

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

  const selectedHouse = houses.find((h) => h.id === filterHouseId);
  const hasActiveFilters = filterHouseId || filterMonth;

  const clearFilters = () => {
    setFilterHouseId('');
    setFilterMonth('');
    setFilterFinished(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Revisiones</h1>
          <p className="text-gray-500">
            Listas de comprobación por casa y fecha
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva revisión
        </Button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterFinished === undefined ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(undefined)}
        >
          Todos
        </Button>
        <Button
          variant={filterFinished === false ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(false)}
        >
          En curso
        </Button>
        <Button
          variant={filterFinished === true ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(true)}
        >
          Finalizados
        </Button>
      </div>

      {/* Filtros por casa y fecha */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filtro por casa */}
        <div className="relative">
          <button
            onClick={() => setShowHouseDropdown(!showHouseDropdown)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              filterHouseId
                ? 'border-[#126D9B] bg-[#126D9B]/5 text-[#126D9B]'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="max-w-[180px] truncate">
              {selectedHouse ? selectedHouse.houseName : 'Filtrar por casa'}
            </span>
            {filterHouseId ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterHouseId('');
                  setShowHouseDropdown(false);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-[#126D9B]/20"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showHouseDropdown && (
            <>
              <div
                className="fixed inset-0 z-30 bg-black/20"
                onClick={() => setShowHouseDropdown(false)}
                aria-hidden
              />
              <div className="absolute top-full left-0 mt-1 z-40 w-64 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setFilterHouseId('');
                    setShowHouseDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    !filterHouseId ? 'text-[#126D9B] font-medium bg-[#126D9B]/5' : 'text-gray-700'
                  }`}
                >
                  Todas las casas
                </button>
                {houses.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setFilterHouseId(h.id);
                      setShowHouseDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      filterHouseId === h.id
                        ? 'text-[#126D9B] font-medium bg-[#126D9B]/5'
                        : 'text-gray-700'
                    }`}
                  >
                    {h.houseName}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filtro por mes */}
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              filterMonth
                ? 'border-[#126D9B] bg-[#126D9B]/5 text-[#126D9B]'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-sm appearance-none pr-5"
            >
              <option value="">Todos los meses</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="p-0.5 rounded-full hover:bg-[#126D9B]/20"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contador */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          {checklists.length} revisión
          {checklists.length !== 1 ? 'es' : ''}
          {hasNextPage && ' cargados'}
        </p>
      )}

      {/* Lista */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al cargar revisiones: {error?.message || 'Error desconocido'}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando...
        </div>
      ) : checklists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#126D9B]/20 to-[#67B26F]/20 flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-[#126D9B]" />
          </div>
          <p className="font-heading text-gray-800 font-medium mb-1">
            {hasActiveFilters ? 'No hay revisiones con estos filtros' : 'No hay revisiones'}
          </p>
          <p className="text-sm text-gray-500">
            {hasActiveFilters ? 'Prueba a cambiar los filtros' : 'Crea la primera revisión desde el botón superior'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((cl) => {
            const houseName = getHouseName(cl);
            const progress =
              cl.total > 0
                ? `${Math.min(cl.done || 0, cl.total)}/${cl.total}`
                : '—';

            return (
              <Card
                key={cl.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedChecklist(cl)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      cl.finished
                        ? 'bg-[#67B26F]/10 text-[#67B26F]'
                        : 'bg-[#126D9B]/10 text-[#126D9B]'
                    }`}
                  >
                    {cl.finished ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <CheckSquare className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {(cl.houseId || cl.house?.[0]?.id || cl.house?.id) ? (
                        <Link
                          to={`/casas/${cl.houseId || cl.house?.[0]?.id || cl.house?.id}`}
                          className="text-[#126D9B] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {houseName}
                        </Link>
                      ) : (
                        houseName
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Fecha: {formatChecklistDate(cl.date)} · {progress} puntos
                    </p>
                    {cl.observations && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {cl.observations}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      {cl.finished && (
                        <span className="text-[#67B26F] font-medium">
                          Finalizado
                        </span>
                      )}
                      {(cl.workers || []).map((w, i) => (
                        <Link
                          key={w.id || i}
                          to={w.id ? `/trabajadores/${w.id}` : '#'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${w.id ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User className="w-3 h-3" />
                          {`${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Trabajador'}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Sentinel para infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando más...
            </div>
          )}

          {!hasNextPage && checklists.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-2">
              No hay más revisiones
            </p>
          )}
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
