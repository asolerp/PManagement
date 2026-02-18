import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Clock, CheckCircle, AlertCircle, Database, RefreshCw, Calendar, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Home, Camera, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useWorkShiftStats, useWorkShifts, useMigrateEntrances } from '@/hooks/useWorkShifts';
import { useChecklists } from '@/hooks/useFirestore';
import { useNavigate } from 'react-router-dom';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

function StatCard({ icon: Icon, label, value, subvalue, color }) {
  const colors = {
    primary: 'bg-[#126D9B]/10 text-[#126D9B]',
    secondary: 'bg-[#3B8D7A]/10 text-[#3B8D7A]',
    accent: 'bg-[#67B26F]/10 text-[#67B26F]',
    warning: 'bg-amber-100 text-amber-600',
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subvalue && (
              <p className="text-xs text-gray-400">{subvalue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentShiftsTable({ shifts }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  if (!shifts?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay jornadas registradas
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date || a.firstEntry) - new Date(b.date || b.firstEntry);
        break;
      case 'worker':
        comparison = (a.workerName || '').localeCompare(b.workerName || '');
        break;
      case 'entry':
        comparison = new Date(a.firstEntry || 0) - new Date(b.firstEntry || 0);
        break;
      case 'exit':
        comparison = new Date(a.lastExit || 0) - new Date(b.lastExit || 0);
        break;
      case 'total':
        comparison = (a.totalMinutes || 0) - (b.totalMinutes || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-[#126D9B]" />
      : <ArrowDown className="w-3.5 h-3.5 text-[#126D9B]" />;
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <SortableHeader field="date">Fecha</SortableHeader>
            <SortableHeader field="worker">Trabajador</SortableHeader>
            <SortableHeader field="entry">Entrada</SortableHeader>
            <SortableHeader field="exit">Salida</SortableHeader>
            <SortableHeader field="total">Total</SortableHeader>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedShifts.map((shift) => (
            <tr key={shift.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-600">
                {shift.date 
                  ? format(new Date(shift.date), 'dd/MM/yyyy')
                  : shift.firstEntry 
                    ? format(new Date(shift.firstEntry), 'dd/MM/yyyy')
                    : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {shift.workerPhoto ? (
                      <img
                        src={shift.workerPhoto}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {shift.workerName?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {shift.workerName}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.firstEntry
                  ? format(new Date(shift.firstEntry), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.lastExit
                  ? format(new Date(shift.lastExit), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.totalMinutes > 0
                  ? `${Math.floor(shift.totalMinutes / 60)}h ${shift.totalMinutes % 60}m`
                  : '-'}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    shift.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {shift.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Completada
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      En curso
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Procesar datos por trabajador
function useWorkerStats(shifts) {
  return useMemo(() => {
    if (!shifts?.length) return [];

    const workerMap = new Map();

    shifts.forEach((shift) => {
      const workerId = shift.workerId;
      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          id: workerId,
          name: shift.workerName || 'Sin nombre',
          photo: shift.workerPhoto,
          totalMinutes: 0,
          daysWorked: 0,
          completedShifts: 0,
          inProgressShifts: 0,
        });
      }

      const worker = workerMap.get(workerId);
      worker.totalMinutes += shift.totalMinutes || 0;
      worker.daysWorked += 1;
      if (shift.status === 'completed') {
        worker.completedShifts += 1;
      } else {
        worker.inProgressShifts += 1;
      }
    });

    return Array.from(workerMap.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [shifts]);
}

// Tarjetas resumen por trabajador
function WorkerSummaryCards({ workerStats }) {
  if (!workerStats?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de trabajadores para este periodo
      </div>
    );
  }

  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getAveragePerDay = (totalMinutes, days) => {
    if (!days) return '0h';
    const avgMinutes = Math.round(totalMinutes / days);
    return formatHours(avgMinutes);
  };

  return (
    <div className="space-y-2">
      {workerStats.map((worker, index) => (
        <div 
          key={worker.id} 
          className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
        >
          {/* Avatar + Ranking */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#126D9B] to-[#67B26F] flex items-center justify-center overflow-hidden">
              {worker.photo ? (
                <img
                  src={worker.photo}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className="text-white font-semibold text-sm"
                style={{ display: worker.photo ? 'none' : 'flex' }}
              >
                {worker.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            {index < 3 && (
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
              }`}>
                {index + 1}
              </div>
            )}
          </div>

          {/* Nombre */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{worker.name}</p>
            <p className="text-xs text-gray-500">{worker.daysWorked} días</p>
          </div>

          {/* Stats en línea */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-base font-bold text-[#126D9B]">{formatHours(worker.totalMinutes)}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-600">{getAveragePerDay(worker.totalMinutes, worker.daysWorked)}</p>
              <p className="text-[10px] text-gray-400">Media/día</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                <span className="text-green-600">{worker.completedShifts}</span>
                {worker.inProgressShifts > 0 && (
                  <span className="text-amber-500">/{worker.inProgressShifts}</span>
                )}
              </p>
              <p className="text-[10px] text-gray-400">Jornadas</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Gráfico de barras de horas por trabajador
function HoursBarChart({ workerStats }) {
  if (!workerStats?.length) {
    return null;
  }

  // Preparar datos para el gráfico
  const chartData = workerStats.slice(0, 10).map((worker) => ({
    name: worker.name?.split(' ')[0] || 'N/A', // Solo primer nombre
    fullName: worker.name,
    hours: Math.round((worker.totalMinutes / 60) * 10) / 10,
    minutes: worker.totalMinutes,
  }));

  const colors = ['#126D9B', '#3B8D7A', '#67B26F', '#8BC34A', '#AED581'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.fullName}</p>
          <p className="text-sm text-[#126D9B]">
            {Math.floor(data.minutes / 60)}h {data.minutes % 60}m
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `${value}h`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={80}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="hours" 
            radius={[0, 4, 4, 0]}
            maxBarSize={30}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MigrationCard() {
  const [result, setResult] = useState(null);
  const migrate = useMigrateEntrances();

  const handleMigrate = async (dryRun) => {
    try {
      const data = await migrate.mutateAsync({ dryRun });
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <Database className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Migrar datos históricos</h3>
            <p className="text-sm text-gray-500 mt-1">
              Convierte los registros de entradas existentes a jornadas laborales.
            </p>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMigrate(true)}
                loading={migrate.isPending}
              >
                Simular (sin cambios)
              </Button>
              <Button
                size="sm"
                onClick={() => handleMigrate(false)}
                loading={migrate.isPending}
              >
                Ejecutar migración
              </Button>
            </div>

            {result && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                result.error 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {result.error ? (
                  <p>Error: {result.error}</p>
                ) : (
                  <div>
                    <p className="font-medium">
                      {result.dryRun ? '✓ Simulación completada' : '✓ Migración completada'}
                    </p>
                    <ul className="mt-1 space-y-1">
                      <li>• Entradas procesadas: {result.totalEntrances}</li>
                      <li>• Jornadas a crear: {result.created}</li>
                      <li>• Ya existentes (omitidas): {result.skipped}</li>
                      {result.errors > 0 && <li>• Errores: {result.errors}</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') date = value.toDate();
    else if (value.seconds) date = new Date(value.seconds * 1000);
    else if (value._d) date = value._d;
    else date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM", { locale: es });
  } catch {
    return '—';
  }
}

function ActiveChecklistsSection() {
  const { data: checklists = [], isLoading } = useChecklists({ finished: false });
  const navigate = useNavigate();
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  if (isLoading) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#126D9B]" />
          <h2 className="text-lg font-semibold text-gray-900">Checklists en curso</h2>
        </div>
        <div className="p-6 text-center text-gray-400 text-sm">Cargando...</div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#126D9B]" />
            <h2 className="text-lg font-semibold text-gray-900">Checklists en curso</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{checklists.length} pendientes</span>
            <button
              onClick={() => navigate('/checklists')}
              className="text-sm text-[#126D9B] font-medium hover:underline"
            >
              Ver todos
            </button>
          </div>
        </div>

        {checklists.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-10 h-10 text-[#67B26F] mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Todos los checklists están completados</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {checklists.slice(0, 8).map((cl) => {
              const houseName = cl.house?.[0]?.houseName || cl.houseName || 'Sin casa';
              const done = cl.done || 0;
              const total = cl.total || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const workers = cl.workers || [];

              return (
                <div
                  key={cl.id}
                  className="px-6 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedChecklist(cl)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm truncate">{houseName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{formatDate(cl.date)}</span>
                        {workers.length > 0 && (
                          <span className="text-xs text-gray-400">
                            {workers.map(w => `${w.firstName || ''}`.trim()).filter(Boolean).join(', ') || `${workers.length} asignados`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#126D9B]">{done}/{total}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[#126D9B] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {checklists.length > 8 && (
              <div className="px-6 py-3 text-center">
                <button
                  onClick={() => navigate('/checklists')}
                  className="text-sm text-[#126D9B] font-medium hover:underline"
                >
                  Ver {checklists.length - 8} más...
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
    </>
  );
}

// Opciones de periodo
const periodOptions = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' },
];

// Generar años disponibles (desde 2020 hasta el actual)
const currentYear = new Date().getFullYear();
const availableYears = Array.from(
  { length: currentYear - 2019 },
  (_, i) => currentYear - i
);

// Generar meses
const months = [
  { value: 0, label: 'Enero' },
  { value: 1, label: 'Febrero' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' },
];

const getDateRange = (periodId, selectedYear, selectedMonth) => {
  const today = new Date();
  
  switch (periodId) {
    case 'today':
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'month':
      const monthDate = new Date(selectedYear, selectedMonth, 1);
      return {
        startDate: format(startOfMonth(monthDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
      };
    case 'year':
      const yearStart = new Date(selectedYear, 0, 1);
      const yearEnd = new Date(selectedYear, 11, 31);
      return {
        startDate: format(yearStart, 'yyyy-MM-dd'),
        endDate: format(yearEnd, 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
  }
};

export default function DashboardPage() {
  const today = new Date();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [dateRange, setDateRange] = useState(getDateRange('month', today.getFullYear(), today.getMonth()));

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useWorkShiftStats(dateRange.startDate);
  const { data: shiftsData, isLoading: shiftsLoading, refetch: refetchShifts } = useWorkShifts({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 500,
  });

  const stats = statsData?.stats || {};
  const shifts = shiftsData?.shifts || [];
  const workerStats = useWorkerStats(shifts);

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    setDateRange(getDateRange(periodId, selectedYear, selectedMonth));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setDateRange(getDateRange(selectedPeriod, year, selectedMonth));
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setDateRange(getDateRange(selectedPeriod, selectedYear, month));
  };

  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleRefresh = () => {
    refetchStats();
    refetchShifts();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handlePeriodChange(option.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === option.id
                  ? 'bg-[#126D9B] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month selector - only show when period is 'month' */}
          {selectedPeriod === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Migration Card - show if no shifts */}
      {!shiftsLoading && shifts.length === 0 && (
        <MigrationCard />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Trabajadores hoy"
          value={statsLoading ? '...' : stats.totalWorkersToday || 0}
          subvalue={`de ${stats.totalRegisteredWorkers || 0} registrados`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          label="Jornadas completadas"
          value={statsLoading ? '...' : stats.completedShifts || 0}
          color="accent"
        />
        <StatCard
          icon={AlertCircle}
          label="En curso"
          value={statsLoading ? '...' : stats.inProgressShifts || 0}
          color="warning"
        />
        <StatCard
          icon={Clock}
          label="Horas trabajadas"
          value={statsLoading ? '...' : formatHours(stats.totalMinutesWorked)}
          subvalue="total del día"
          color="secondary"
        />
      </div>

      {/* Active Checklists */}
      <ActiveChecklistsSection />

      {/* Worker visualizations - Grid layout */}
      {!shiftsLoading && workerStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hours chart */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#126D9B]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Horas por trabajador
              </h2>
            </div>
            <div className="p-4">
              <HoursBarChart workerStats={workerStats} />
            </div>
          </Card>

          {/* Top workers summary */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3B8D7A]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Resumen por trabajador
              </h2>
            </div>
            <div className="p-4 max-h-[320px] overflow-y-auto">
              <WorkerSummaryCards workerStats={workerStats.slice(0, 6)} />
            </div>
          </Card>
        </div>
      )}

      {/* All worker cards - Full width when more than 6 workers */}
      {!shiftsLoading && workerStats.length > 6 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#67B26F]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Todos los trabajadores
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {workerStats.length} trabajadores
            </span>
          </div>
          <div className="p-4">
            <WorkerSummaryCards workerStats={workerStats} />
          </div>
        </Card>
      )}

      {/* Recent shifts */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Jornadas {selectedPeriod === 'today' ? 'de hoy' : 
                      selectedPeriod === 'week' ? 'de la semana' :
                      selectedPeriod === 'month' ? 'del mes' :
                      selectedPeriod === 'lastMonth' ? 'del mes anterior' :
                      'del año'}
          </h2>
          <span className="text-sm text-gray-500">
            {shifts.length} registros
          </span>
        </div>
        <div className="p-4">
          {shiftsLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <RecentShiftsTable shifts={shifts} />
          )}
        </div>
      </Card>
    </div>
  );
}
