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
import { Users, Clock, CheckCircle, AlertCircle, AlertTriangle, RefreshCw, Calendar, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Home, Camera, FileText, ChevronRight, Briefcase, Activity, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useWorkShiftStats, useWorkShifts } from '@/hooks/useWorkShifts';
import { useChecklists, useIncidences, useJobs, useHouses, useWorkersFirestore } from '@/hooks/useFirestore';
import { useNavigate, Link } from 'react-router-dom';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import IncidenceDetailPanel from '@/components/IncidenceDetailPanel';
import ShiftDetailPanel from '@/components/ShiftDetailPanel';
import { getIncidenceSlaStatus, getJobSlaStatus } from '@/utils/sla';
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
    primary: 'bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-600 dark:text-turquoise-400',
    secondary: 'bg-turquoise-100/80 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-400',
    accent: 'bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-600 dark:text-turquoise-400',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  return (
    <Card>
      <CardContent className="py-5 sm:py-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colors[color] || colors.primary}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-stone-500 truncate">{label}</p>
            <p className="font-heading text-xl sm:text-2xl font-semibold text-stone-900 mt-0.5">{value}</p>
            {subvalue && (
              <p className="text-xs text-stone-400 truncate mt-0.5">{subvalue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentShiftsTable({ shifts, onShiftClick }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  if (!shifts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-turquoise-50 dark:bg-turquoise-900/30 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-turquoise-500 dark:text-turquoise-400" />
        </div>
        <p className="font-heading text-stone-800 font-medium mb-1">No hay jornadas registradas</p>
        <p className="text-sm text-stone-500">Selecciona otro periodo o fecha</p>
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
      ? <ArrowUp className="w-3.5 h-3.5 text-turquoise-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-turquoise-600" />;
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="text-left py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <table className="w-full min-w-[540px]">
        <thead>
          <tr className="border-b border-gray-200">
            <SortableHeader field="date">Fecha</SortableHeader>
            <SortableHeader field="worker">Trabajador</SortableHeader>
            <SortableHeader field="entry">Entrada</SortableHeader>
            <SortableHeader field="exit">Salida</SortableHeader>
            <SortableHeader field="total">Total</SortableHeader>
            <th className="text-left py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedShifts.map((shift) => (
            <tr
              key={shift.id}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => onShiftClick?.(shift)}
            >
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {shift.date 
                  ? format(new Date(shift.date), 'dd/MM/yy')
                  : shift.firstEntry 
                    ? format(new Date(shift.firstEntry), 'dd/MM/yy')
                    : '-'}
              </td>
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
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
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                    {shift.workerName}
                  </span>
                </div>
              </td>
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm text-gray-600">
                {shift.firstEntry
                  ? format(new Date(shift.firstEntry), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm text-gray-600">
                {shift.lastExit
                  ? format(new Date(shift.lastExit), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {shift.totalMinutes > 0
                  ? `${Math.floor(shift.totalMinutes / 60)}h ${shift.totalMinutes % 60}m`
                  : '-'}
              </td>
              <td className="py-2.5 sm:py-3 px-2.5 sm:px-4">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
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
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-turquoise-50 dark:bg-turquoise-900/30 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-turquoise-500 dark:text-turquoise-400" />
        </div>
        <p className="font-heading text-stone-800 font-medium mb-1">No hay datos de trabajadores</p>
        <p className="text-sm text-stone-500">Para este periodo no hay jornadas registradas</p>
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
    <div className="space-y-1.5 sm:space-y-2">
      {workerStats.map((worker, index) => (
        <div 
          key={worker.id} 
          className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-soft)] hover:border-turquoise-200 hover:shadow-[var(--shadow)] transition-all"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-turquoise-500 flex items-center justify-center overflow-hidden">
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

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{worker.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{worker.daysWorked} días</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <div>
              <p className="text-sm sm:text-base font-semibold text-turquoise-600">{formatHours(worker.totalMinutes)}</p>
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

function HoursBarChart({ workerStats }) {
  if (!workerStats?.length) return null;

  const chartData = workerStats.slice(0, 10).map((worker) => ({
    name: worker.name?.split(' ')[0] || 'N/A',
    fullName: worker.name,
    hours: Math.round((worker.totalMinutes / 60) * 10) / 10,
    minutes: worker.totalMinutes,
  }));

  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 1);
  const colors = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#99f6e4'];

  const formatMin = (m) => {
    if (!m) return '0h';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--surface-elevated)] px-3 py-2 shadow-lg rounded-xl border border-[var(--border-soft)]">
          <p className="font-medium text-stone-900 text-sm">{data.fullName}</p>
          <p className="text-sm text-turquoise-600">{formatMin(data.minutes)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Mobile: CSS bars */}
      <div className="sm:hidden space-y-2">
        {chartData.map((worker, i) => (
          <div key={worker.name + i} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 w-14 truncate flex-shrink-0">{worker.name}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${Math.max((worker.minutes / maxMinutes) * 100, 4)}%`,
                  backgroundColor: colors[i % colors.length],
                }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 w-12 text-right flex-shrink-0">
              {formatMin(worker.minutes)}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop: Recharts */}
      <div className="hidden sm:block h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => `${value}h`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
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

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

function isJobToday(job, today) {
  const t = today || todayStr();
  if (!job?.date) return false;
  const d = job.date;
  if (typeof d === 'string') return d === t;
  if (d?.toDate && typeof d.toDate === 'function') return format(d.toDate(), 'yyyy-MM-dd') === t;
  if (d?.seconds != null) return format(new Date(d.seconds * 1000), 'yyyy-MM-dd') === t;
  return false;
}

const SLA_BADGE_CLASS = {
  ok: 'bg-emerald-50 text-emerald-700',
  at_risk: 'bg-amber-100 text-amber-800 border border-amber-200',
  breached: 'bg-red-100 text-red-700 border border-red-200',
};

function ActivitySummaryBar({ openIncidences = [], jobsToday = [], checklistsInProgress = [], shiftsInProgress = [] }) {
  const navigate = useNavigate();
  const pills = [
    {
      label: 'Incidencias abiertas',
      count: openIncidences.length,
      dot: 'bg-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      to: '/incidencias',
    },
    {
      label: 'Trabajos hoy',
      count: jobsToday.length,
      dot: 'bg-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      to: '/trabajos',
    },
    {
      label: 'Revisiones',
      count: checklistsInProgress.length,
      dot: 'bg-turquoise-400',
      bg: 'bg-turquoise-50 dark:bg-turquoise-900/20',
      text: 'text-turquoise-700 dark:text-turquoise-400',
      border: 'border-turquoise-200 dark:border-turquoise-800/50',
      to: '/checklists',
    },
    {
      label: 'Jornadas abiertas',
      count: shiftsInProgress.length,
      dot: 'bg-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      to: '/jornadas',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map(({ label, count, dot, bg, text, border, to }) => (
        <button
          key={label}
          type="button"
          onClick={() => navigate(to)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${bg} ${text} ${border} hover:opacity-80 transition-opacity cursor-pointer`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
          <span className="font-semibold text-sm">{count}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function EstadoDelDiaPanel() {
  const navigate = useNavigate();
  const today = todayStr();
  const { data: openIncidences = [], isLoading: loadingIncidences } = useIncidences({ done: false });
  const { data: allJobs = [], isLoading: loadingJobs } = useJobs();
  const { data: checklistsInProgress = [], isLoading: loadingChecklists } = useChecklists({ finished: false });
  const { data: shiftsData, isLoading: loadingShifts } = useWorkShifts({
    startDate: today,
    endDate: today,
    limit: 500,
  });

  const jobsToday = useMemo(() => allJobs.filter((j) => isJobToday(j, today)), [allJobs, today]);
  const jobsTodayPending = useMemo(() => jobsToday.filter((j) => !j.done && j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled'), [jobsToday]);
  const jobsTodayCompleted = useMemo(() => jobsToday.filter((j) => j.done || j.status === 'done' || j.status === 'completed'), [jobsToday]);
  const shiftsInProgress = useMemo(() => (shiftsData?.shifts || []).filter((s) => !s.lastExit), [shiftsData?.shifts]);

  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const { data: houses = [] } = useHouses();
  const { data: allWorkers = [] } = useWorkersFirestore();
  const isLoading = loadingIncidences || loadingJobs || loadingChecklists || loadingShifts;

  if (isLoading) {
    return (
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-turquoise-50 dark:bg-turquoise-900/30">
            <Activity className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">Estado del día</h2>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const hasContent = openIncidences.length > 0 || jobsToday.length > 0 || checklistsInProgress.length > 0 || shiftsInProgress.length > 0;

  const sections = [
    {
      key: 'incidencias',
      icon: AlertCircle,
      label: 'Incidencias abiertas',
      count: openIncidences.length,
      dot: 'bg-red-400',
      countBg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      linkTo: '/incidencias',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin incidencias abiertas',
      content: openIncidences.length === 0 ? null : (
        <ul className="space-y-1">
          {openIncidences.slice(0, 5).map((inc) => {
            const sla = getIncidenceSlaStatus(inc);
            return (
              <li key={inc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIncidence(inc)}
                  className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-sm text-stone-900 dark:text-stone-100 truncate flex-1 group-hover:text-turquoise-600">
                    {inc.house?.houseName || inc.houseName || 'Sin casa'}
                  </span>
                  {sla && sla.status !== 'ok' && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${SLA_BADGE_CLASS[sla.status]}`}>
                      {sla.status === 'breached' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                      {sla.label}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                </button>
              </li>
            );
          })}
          {openIncidences.length > 5 && (
            <li>
              <Link to="/incidencias" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-0.5">
                +{openIncidences.length - 5} más
              </Link>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'trabajos',
      icon: Briefcase,
      label: 'Trabajos de hoy',
      count: jobsToday.length,
      dot: 'bg-blue-400',
      countBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      linkTo: '/trabajos',
      linkLabel: 'Ver todos',
      emptyLabel: 'Sin trabajos programados hoy',
      subtext: jobsToday.length > 0 ? `${jobsTodayPending.length} pendiente${jobsTodayPending.length !== 1 ? 's' : ''} · ${jobsTodayCompleted.length} completado${jobsTodayCompleted.length !== 1 ? 's' : ''}` : null,
      content: jobsToday.length === 0 ? null : (
        <ul className="space-y-1">
          {jobsToday.slice(0, 5).map((job) => {
            const sla = getJobSlaStatus(job);
            const isDone = job.done || job.status === 'done' || job.status === 'completed';
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => navigate('/trabajos')}
                  className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className={`text-sm truncate flex-1 group-hover:text-turquoise-600 ${isDone ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-900 dark:text-stone-100'}`}>
                    {job.house?.houseName || job.houseName || job.title || 'Trabajo'}
                  </span>
                  {!isDone && sla && sla.status !== 'ok' && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${SLA_BADGE_CLASS[sla.status]}`}>
                      {sla.status === 'breached' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                      {sla.label}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                </button>
              </li>
            );
          })}
          {jobsToday.length > 5 && (
            <li>
              <Link to="/trabajos" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-0.5">
                +{jobsToday.length - 5} más
              </Link>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'checklists',
      icon: CheckSquare,
      label: 'Revisiones en curso',
      count: checklistsInProgress.length,
      dot: 'bg-turquoise-400',
      countBg: 'bg-turquoise-100 dark:bg-turquoise-900/30 text-turquoise-700 dark:text-turquoise-400',
      linkTo: '/checklists',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin revisiones activas',
      content: checklistsInProgress.length === 0 ? null : (
        <ul className="space-y-2">
          {checklistsInProgress.slice(0, 5).map((cl) => {
            const houseName = cl.house?.[0]?.houseName || cl.houseName || 'Sin casa';
            const done = cl.done || 0;
            const total = cl.total || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <li key={cl.id}>
                <button
                  type="button"
                  onClick={() => setSelectedChecklist(cl)}
                  className="w-full text-left flex flex-col gap-1 py-1.5 px-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span className="text-sm text-stone-900 dark:text-stone-100 truncate flex-1 group-hover:text-turquoise-600">{houseName}</span>
                    <span className="text-xs text-turquoise-600 font-semibold flex-shrink-0">{pct}%</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                  </div>
                  <div className="ml-5.5 h-1.5 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-turquoise-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="ml-5.5 text-[10px] text-stone-400 dark:text-stone-600">{done} de {total} ítems</p>
                </button>
              </li>
            );
          })}
          {checklistsInProgress.length > 5 && (
            <li>
              <button type="button" onClick={() => navigate('/checklists')} className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-0.5">
                +{checklistsInProgress.length - 5} más
              </button>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'jornadas',
      icon: Clock,
      label: 'Jornadas abiertas',
      count: shiftsInProgress.length,
      dot: 'bg-amber-400',
      countBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      linkTo: '/jornadas',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin jornadas en curso',
      content: shiftsInProgress.length === 0 ? null : (
        <ul className="space-y-1">
          {shiftsInProgress.slice(0, 5).map((shift) => (
            <li key={shift.id}>
              <button
                type="button"
                onClick={() => navigate('/jornadas')}
                className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-sm text-stone-900 dark:text-stone-100 truncate flex-1 group-hover:text-turquoise-600">{shift.workerName || 'Trabajador'}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500 flex-shrink-0">
                  {shift.firstEntry ? format(new Date(shift.firstEntry), 'HH:mm') : '—'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
              </button>
            </li>
          ))}
          {shiftsInProgress.length > 5 && (
            <li>
              <Link to="/jornadas" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-0.5">
                +{shiftsInProgress.length - 5} más
              </Link>
            </li>
          )}
        </ul>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-turquoise-50 dark:bg-turquoise-900/30">
              <Activity className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
            </div>
            <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">Estado del día</h2>
          </div>
          {!hasContent && (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">Todo al día</span>
          )}
        </div>

        {!hasContent ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-stone-700 dark:text-stone-300 font-medium text-sm">Sin actividad pendiente</p>
            <p className="text-stone-400 dark:text-stone-600 text-xs mt-1">No hay incidencias, trabajos, revisiones ni jornadas abiertas</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sections.map(({ key, icon: Icon, label, count, dot, countBg, linkTo, linkLabel, emptyLabel, subtext, content }) => (
              <div
                key={key}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">{label}</span>
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${countBg}`}>
                      {count}
                    </span>
                  </div>
                  {count > 0 && (
                    <Link to={linkTo} className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium transition-colors">
                      {linkLabel} →
                    </Link>
                  )}
                </div>
                {content ? (
                  <div className="px-3 pb-2.5">
                    {content}
                    {subtext && (
                      <p className="text-[10px] text-stone-400 dark:text-stone-600 mt-1 pl-2">{subtext}</p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 pb-2.5 text-xs text-stone-400 dark:text-stone-600">{emptyLabel}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allOpenIncidences={openIncidences}
          allWorkers={allWorkers}
          allHouses={houses}
        />
      )}
    </>
  );
}

/** Widget: solo incidencias y trabajos con SLA at_risk o breached. Enlaces a listado. */
function SlaEnRiesgoWidget() {
  const today = todayStr();
  const { data: openIncidences = [], isLoading: loadingIncidences } = useIncidences({ done: false });
  const { data: allJobs = [], isLoading: loadingJobs } = useJobs();
  const { data: houses = [] } = useHouses();
  const { data: allWorkers = [] } = useWorkersFirestore();
  const [selectedIncidence, setSelectedIncidence] = useState(null);

  const { incidencesAtRisk, jobsAtRisk } = useMemo(() => {
    const jobsToday = (allJobs || []).filter((j) => isJobToday(j, today));
    const inc = (openIncidences || []).filter((doc) => {
      const s = getIncidenceSlaStatus(doc);
      return s && (s.status === 'at_risk' || s.status === 'breached');
    });
    const job = jobsToday.filter((doc) => {
      const s = getJobSlaStatus(doc);
      return s && (s.status === 'at_risk' || s.status === 'breached');
    });
    return { incidencesAtRisk: inc, jobsAtRisk: job };
  }, [openIncidences, allJobs, today]);

  const isLoading = loadingIncidences || loadingJobs;
  const hasAny = incidencesAtRisk.length > 0 || jobsAtRisk.length > 0;

  const hasBreached = incidencesAtRisk.some((i) => getIncidenceSlaStatus(i)?.status === 'breached')
    || jobsAtRisk.some((j) => getJobSlaStatus(j)?.status === 'breached');

  if (isLoading) {
    return (
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">Plazos en riesgo</h2>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={hasAny ? 'border-amber-200 dark:border-amber-800/50' : ''}>
      <div className={`px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between ${hasAny ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${hasBreached ? 'bg-red-100 dark:bg-red-900/30' : hasAny ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-stone-100 dark:bg-stone-800'}`}>
            <AlertTriangle className={`w-5 h-5 ${hasBreached ? 'text-red-600' : hasAny ? 'text-amber-500' : 'text-stone-400'}`} />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 leading-none">Plazos en riesgo</h2>
            {hasAny && (
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">Incidencias y trabajos con SLA comprometido</p>
            )}
          </div>
        </div>
        {hasAny && (
          <div className="text-right flex-shrink-0">
            <span className={`text-2xl font-bold font-heading leading-none ${hasBreached ? 'text-red-600' : 'text-amber-500'}`}>
              {incidencesAtRisk.length + jobsAtRisk.length}
            </span>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">en riesgo</p>
          </div>
        )}
      </div>

      {!hasAny ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-stone-700 dark:text-stone-300 font-medium text-sm">Todos los plazos al día</p>
          <p className="text-stone-400 dark:text-stone-600 text-xs mt-1">Sin incidencias ni trabajos con SLA en riesgo</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {incidencesAtRisk.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incidencias ({incidencesAtRisk.length})
                </h3>
                <Link to="/incidencias" className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium">Ver todas →</Link>
              </div>
              <ul className="space-y-1.5">
                {incidencesAtRisk.map((inc) => {
                  const sla = getIncidenceSlaStatus(inc);
                  const isBreached = sla?.status === 'breached';
                  return (
                    <li key={inc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedIncidence(inc)}
                        className={`w-full text-left flex items-center gap-2 py-2 px-3 rounded-xl border transition-all group ${
                          isBreached
                            ? 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/40 hover:border-red-300'
                            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 hover:border-amber-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isBreached ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className={`text-sm font-medium min-w-0 flex-1 truncate ${isBreached ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {inc.house?.houseName || inc.houseName || 'Sin casa'}
                        </span>
                        {sla && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-auto ${SLA_BADGE_CLASS[sla.status]}`}>
                            {sla.label}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {jobsAtRisk.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Trabajos ({jobsAtRisk.length})
                </h3>
                <Link to="/trabajos" className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium">Ver todos →</Link>
              </div>
              <ul className="space-y-1.5">
                {jobsAtRisk.map((job) => {
                  const sla = getJobSlaStatus(job);
                  const isBreached = sla?.status === 'breached';
                  return (
                    <li key={job.id}>
                      <Link
                        to="/trabajos"
                        className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl border transition-all group ${
                          isBreached
                            ? 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/40 hover:border-red-300'
                            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 hover:border-amber-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isBreached ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className={`text-sm font-medium min-w-0 flex-1 truncate ${isBreached ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {job.house?.houseName || job.houseName || job.title || 'Trabajo'}
                        </span>
                        {sla && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-auto ${SLA_BADGE_CLASS[sla.status]}`}>
                            {sla.label}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allOpenIncidences={openIncidences}
          allWorkers={allWorkers}
          allHouses={houses}
        />
      )}
    </Card>
  );
}

/** Vista "Cierre del día": jornadas sin salida, trabajos del día no hechos, incidencias fuera de plazo */
function CierreDelDiaSection() {
  const today = todayStr();
  const { data: shiftsData } = useWorkShifts({ startDate: today, endDate: today, limit: 500 });
  const { data: allJobs = [] } = useJobs();
  const { data: openIncidences = [] } = useIncidences({ done: false });
  const { data: houses = [] } = useHouses();
  const { data: allWorkers = [] } = useWorkersFirestore();
  const [selectedIncidence, setSelectedIncidence] = useState(null);

  const shiftsOpen = useMemo(
    () => (shiftsData?.shifts || []).filter((s) => !s.lastExit),
    [shiftsData?.shifts]
  );
  const jobsTodayPending = useMemo(
    () =>
      allJobs.filter(
        (j) => isJobToday(j, today) && !j.done && j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled'
      ),
    [allJobs, today]
  );
  const incidencesBreached = useMemo(
    () => openIncidences.filter((inc) => getIncidenceSlaStatus(inc)?.status === 'breached'),
    [openIncidences]
  );

  const hasAny = shiftsOpen.length > 0 || jobsTodayPending.length > 0 || incidencesBreached.length > 0;

  return (
    <Card className={hasAny ? 'border-red-200 dark:border-red-800/30' : 'border-emerald-200 dark:border-emerald-800/30'}>
      <div className={`px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between ${hasAny ? 'bg-gradient-to-r from-red-50/60 to-transparent dark:from-red-900/10' : 'bg-gradient-to-r from-emerald-50/60 to-transparent dark:from-emerald-900/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${hasAny ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
            <ClipboardCheck className={`w-5 h-5 ${hasAny ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 leading-none">Cierre del día</h2>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">
              {hasAny ? 'Elementos pendientes de cerrar antes de finalizar la jornada' : 'Resumen de jornada'}
            </p>
          </div>
        </div>
        {hasAny && (
          <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold">{shiftsOpen.length + jobsTodayPending.length + incidencesBreached.length} pendiente{shiftsOpen.length + jobsTodayPending.length + incidencesBreached.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {!hasAny ? (
        <div className="px-6 py-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Día cerrado correctamente</p>
            <p className="text-stone-400 dark:text-stone-600 text-xs mt-0.5">No hay jornadas abiertas, trabajos pendientes ni incidencias fuera de plazo</p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Jornadas sin salida */}
            <div className={`rounded-xl border p-3 ${shiftsOpen.length > 0 ? 'border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10' : 'border-[var(--border-soft)] bg-[var(--surface)]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${shiftsOpen.length > 0 ? 'text-amber-500' : 'text-stone-400'}`} />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">Jornadas</span>
                </div>
                <span className={`text-sm font-bold ${shiftsOpen.length > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>{shiftsOpen.length}</span>
              </div>
              {shiftsOpen.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Todo cerrado</p>
              ) : (
                <ul className="space-y-1">
                  {shiftsOpen.slice(0, 3).map((s) => (
                    <li key={s.id}>
                      <Link to="/jornadas" className="flex items-center gap-1.5 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="text-xs text-stone-700 dark:text-stone-300 truncate group-hover:text-turquoise-600">{s.workerName || 'Trabajador'}</span>
                        <span className="text-[10px] text-stone-400 ml-auto flex-shrink-0">{s.firstEntry ? format(new Date(s.firstEntry), 'HH:mm') : '—'}</span>
                      </Link>
                    </li>
                  ))}
                  {shiftsOpen.length > 3 && (
                    <li><Link to="/jornadas" className="text-[10px] text-turquoise-600 hover:underline">+{shiftsOpen.length - 3} más</Link></li>
                  )}
                </ul>
              )}
            </div>

            {/* Trabajos pendientes */}
            <div className={`rounded-xl border p-3 ${jobsTodayPending.length > 0 ? 'border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10' : 'border-[var(--border-soft)] bg-[var(--surface)]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className={`w-3.5 h-3.5 ${jobsTodayPending.length > 0 ? 'text-blue-500' : 'text-stone-400'}`} />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">Trabajos</span>
                </div>
                <span className={`text-sm font-bold ${jobsTodayPending.length > 0 ? 'text-blue-600' : 'text-emerald-500'}`}>{jobsTodayPending.length}</span>
              </div>
              {jobsTodayPending.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Todo completado</p>
              ) : (
                <ul className="space-y-1">
                  {jobsTodayPending.slice(0, 3).map((j) => (
                    <li key={j.id}>
                      <Link to="/trabajos" className="flex items-center gap-1.5 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-xs text-stone-700 dark:text-stone-300 truncate group-hover:text-turquoise-600">{j.house?.houseName || j.houseName || 'Trabajo'}</span>
                      </Link>
                    </li>
                  ))}
                  {jobsTodayPending.length > 3 && (
                    <li><Link to="/trabajos" className="text-[10px] text-turquoise-600 hover:underline">+{jobsTodayPending.length - 3} más</Link></li>
                  )}
                </ul>
              )}
            </div>

            {/* Incidencias fuera de plazo */}
            <div className={`rounded-xl border p-3 ${incidencesBreached.length > 0 ? 'border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10' : 'border-[var(--border-soft)] bg-[var(--surface)]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className={`w-3.5 h-3.5 ${incidencesBreached.length > 0 ? 'text-red-500' : 'text-stone-400'}`} />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">Vencidas</span>
                </div>
                <span className={`text-sm font-bold ${incidencesBreached.length > 0 ? 'text-red-600' : 'text-emerald-500'}`}>{incidencesBreached.length}</span>
              </div>
              {incidencesBreached.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Sin vencidas</p>
              ) : (
                <ul className="space-y-1">
                  {incidencesBreached.slice(0, 3).map((inc) => (
                    <li key={inc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedIncidence(inc)}
                        className="w-full flex items-center gap-1.5 group text-left"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span className="text-xs text-stone-700 dark:text-stone-300 truncate group-hover:text-turquoise-600">{inc.house?.houseName || inc.houseName || 'Incidencia'}</span>
                      </button>
                    </li>
                  ))}
                  {incidencesBreached.length > 3 && (
                    <li><Link to="/incidencias" className="text-[10px] text-turquoise-600 hover:underline">+{incidencesBreached.length - 3} más</Link></li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allOpenIncidences={openIncidences}
          allWorkers={allWorkers}
          allHouses={houses}
        />
      )}
    </Card>
  );
}

/**
 * Contenedor de la sección "Actividad y alertas".
 * Carga los datos compartidos una sola vez y los distribuye a los hijos.
 */
function ActivitySection() {
  const today = todayStr();
  const { data: openIncidences = [] } = useIncidences({ done: false });
  const { data: allJobs = [] } = useJobs();
  const { data: checklistsInProgress = [] } = useChecklists({ finished: false });
  const { data: shiftsData } = useWorkShifts({ startDate: today, endDate: today, limit: 500 });

  const jobsToday = useMemo(() => allJobs.filter((j) => isJobToday(j, today)), [allJobs, today]);
  const shiftsInProgress = useMemo(() => (shiftsData?.shifts || []).filter((s) => !s.lastExit), [shiftsData?.shifts]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Actividad y alertas
        </h2>
      </div>
      <ActivitySummaryBar
        openIncidences={openIncidences}
        jobsToday={jobsToday}
        checklistsInProgress={checklistsInProgress}
        shiftsInProgress={shiftsInProgress}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EstadoDelDiaPanel />
        <SlaEnRiesgoWidget />
      </div>
      <CierreDelDiaSection />
    </section>
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
  const [selectedShift, setSelectedShift] = useState(null);

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
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="pb-5 sm:pb-6 border-b border-[var(--border-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-stone-500 truncate mt-0.5">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} className="flex-shrink-0">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handlePeriodChange(option.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedPeriod === option.id
                  ? 'bg-turquoise-500 text-white shadow-sm'
                  : 'bg-[var(--surface-elevated)] border border-[var(--border)] text-stone-600 hover:bg-stone-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-400 hidden sm:block" />
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 bg-[var(--surface-elevated)]"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {selectedPeriod === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 bg-[var(--surface-elevated)]"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ——— Sección: Resumen del día ——— */}
      <section className="space-y-3">
        <h2 className="font-heading text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Resumen del día
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      {/* ——— Sección: Actividad y alertas (2 columnas en desktop) ——— */}
      <ActivitySection />

      {/* ——— Sección: Jornadas y trabajadores ——— */}
      <section className="space-y-3">
        <h2 className="font-heading text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Jornadas y trabajadores
        </h2>

        {!shiftsLoading && workerStats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
                <div className="p-2 rounded-xl bg-turquoise-50 dark:bg-turquoise-900/30">
                  <TrendingUp className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
                </div>
                <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">
                  Horas por trabajador
                </h2>
              </div>
              <div className="p-5">
                <HoursBarChart workerStats={workerStats} />
              </div>
            </Card>
            <Card>
              <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
                <div className="p-2 rounded-xl bg-turquoise-50 dark:bg-turquoise-900/30">
                  <Users className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
                </div>
                <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">
                  Resumen por trabajador
                </h2>
              </div>
              <div className="p-5 max-h-[320px] overflow-y-auto">
                <WorkerSummaryCards workerStats={workerStats.slice(0, 6)} />
              </div>
            </Card>
          </div>
        )}

        {!shiftsLoading && workerStats.length > 6 && (
          <Card>
            <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-turquoise-50 dark:bg-turquoise-900/30">
                  <Users className="w-5 h-5 text-turquoise-600 dark:text-turquoise-400" />
                </div>
                <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">
                  Todos los trabajadores
                </h2>
              </div>
              <span className="text-sm text-stone-500">
                {workerStats.length} trabajadores
              </span>
            </div>
            <div className="p-5">
              <WorkerSummaryCards workerStats={workerStats} />
            </div>
          </Card>
        )}

        <Card>
          <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">
              Jornadas {selectedPeriod === 'today' ? 'de hoy' : 
                        selectedPeriod === 'week' ? 'de la semana' :
                        selectedPeriod === 'month' ? 'del mes' :
                        selectedPeriod === 'lastMonth' ? 'del mes anterior' :
                        'del año'}
            </h2>
            <span className="text-sm text-stone-500">
              {shifts.length} registros
            </span>
          </div>
          <div className="p-5">
            {shiftsLoading ? (
              <div className="text-center py-10 text-stone-500">Cargando...</div>
            ) : (
              <RecentShiftsTable shifts={shifts} onShiftClick={setSelectedShift} />
            )}
          </div>
        </Card>
      </section>

      {selectedShift && (
        <ShiftDetailPanel
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
}
