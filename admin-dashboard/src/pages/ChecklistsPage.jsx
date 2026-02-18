import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useChecklistsPaginated, useHouses } from '@/hooks/useFirestore';
import {
  CheckSquare,
  CheckCircle,
  Home,
  CalendarDays,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
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

  const selectedHouse = houses.find((h) => h.id === filterHouseId);
  const hasActiveFilters = filterHouseId || filterMonth;

  const clearFilters = () => {
    setFilterHouseId('');
    setFilterMonth('');
    setFilterFinished(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
        <p className="text-gray-500">
          Listas de comprobación por casa y fecha
        </p>
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
                className="fixed inset-0 z-30"
                onClick={() => setShowHouseDropdown(false)}
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
          {checklists.length} checklist
          {checklists.length !== 1 ? 's' : ''}
          {hasNextPage && ' cargados'}
        </p>
      )}

      {/* Lista */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al cargar checklists: {error?.message || 'Error desconocido'}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando...
        </div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {hasActiveFilters
            ? 'No hay checklists con estos filtros'
            : 'No hay checklists'}
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
                    <p className="font-medium text-gray-900">{houseName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Fecha: {formatChecklistDate(cl.date)} · {progress} checks
                    </p>
                    {cl.observations && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {cl.observations}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {cl.finished && (
                        <span className="text-[#67B26F] font-medium">
                          Finalizado
                        </span>
                      )}
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
              No hay más checklists
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
    </div>
  );
}
