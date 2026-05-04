import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subDays,
  formatDistanceToNowStrict,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Clock, CheckCircle, AlertCircle, AlertTriangle, RefreshCw, Calendar, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Home, Camera, FileText, ChevronRight, Briefcase, Activity, ClipboardCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
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
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pill } from '@/components/ui/Pill';

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

const SLA_PILL_VARIANT = {
  ok: 'low',
  at_risk: 'high',
  breached: 'critical',
};

const PRIORITY_PILL_VARIANT = {
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

function toJsDateSafe(value) {
  if (!value) return null;
  try {
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds != null) return new Date(value.seconds * 1000);
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function relativeAge(value) {
  const d = toJsDateSafe(value);
  if (!d) return null;
  return formatDistanceToNowStrict(d, { addSuffix: false, locale: es });
}

function workerInitials(worker) {
  if (!worker) return '?';
  const name = worker.firstName || worker.name || worker.displayName || '';
  return (name.charAt(0) || '?').toUpperCase();
}

function workerDisplayName(worker) {
  if (!worker) return 'Trabajador';
  const first = worker.firstName || '';
  const last = worker.lastName || '';
  const full = `${first} ${last}`.trim();
  return full || worker.name || worker.displayName || 'Trabajador';
}

function AssignedAvatars({ workers = [], unassignedLabel = 'Sin asignar' }) {
  if (!workers || workers.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
        <UserX className="w-3 h-3" />
        {unassignedLabel}
      </span>
    );
  }
  const visible = workers.slice(0, 2);
  const rest = workers.length - visible.length;
  return (
    <span className="inline-flex items-center -space-x-1.5 flex-shrink-0" title={workers.map(workerDisplayName).join(', ')}>
      {visible.map((w, i) => (
        <span
          key={w.id || i}
          className="w-5 h-5 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--surface-elevated)]"
        >
          {workerInitials(w)}
        </span>
      ))}
      {rest > 0 && (
        <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--surface-elevated)]">
          +{rest}
        </span>
      )}
    </span>
  );
}

function SlaPill({ sla }) {
  if (!sla || sla.status === 'ok') return null;
  return (
    <Pill variant={SLA_PILL_VARIANT[sla.status] ?? 'neutral'} dot={sla.status === 'breached'}>
      {sla.label}
    </Pill>
  );
}

function SectionHead({ icon: Icon, iconClassName = 'text-stone-400', title, hint, right }) {
  return (
    <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconClassName}`} strokeWidth={1.75} />}
        <h2 className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
          {title}
        </h2>
        {hint && <span className="text-xs text-stone-400 truncate hidden sm:inline">· {hint}</span>}
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

function ActivitySummaryBar({ openIncidences = [], jobsToday = [], checklistsInProgress = [], shiftsInProgress = [] }) {
  const navigate = useNavigate();
  const items = [
    { label: 'Incidencias abiertas', count: openIncidences.length, variant: openIncidences.length > 0 ? 'critical' : 'neutral', to: '/incidencias' },
    { label: 'Trabajos hoy', count: jobsToday.length, variant: jobsToday.length > 0 ? 'info' : 'neutral', to: '/trabajos' },
    { label: 'Revisiones', count: checklistsInProgress.length, variant: checklistsInProgress.length > 0 ? 'info' : 'neutral', to: '/checklists' },
    { label: 'Jornadas abiertas', count: shiftsInProgress.length, variant: shiftsInProgress.length > 0 ? 'medium' : 'neutral', to: '/jornadas' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, count, variant, to }) => (
        <button
          key={label}
          type="button"
          onClick={() => navigate(to)}
          className="rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-500/40"
        >
          <Pill variant={variant} size="md" dot={count > 0}>
            <span className="font-semibold tabular-nums">{count}</span>
            <span className="font-normal opacity-90">{label}</span>
          </Pill>
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
        <SectionHead icon={Activity} title="Estado del día" />
        <div className="p-5 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-lg bg-[var(--color-surface-subtle)] dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const hasContent = openIncidences.length > 0 || jobsToday.length > 0 || checklistsInProgress.length > 0 || shiftsInProgress.length > 0;

  const sections = [
    {
      key: 'incidencias',
      label: 'Incidencias abiertas',
      count: openIncidences.length,
      variant: 'critical',
      linkTo: '/incidencias',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin incidencias abiertas',
      content: openIncidences.length === 0 ? null : (
        <ul className="space-y-0.5">
          {openIncidences.slice(0, 5).map((inc) => {
            const sla = getIncidenceSlaStatus(inc);
            const title = inc.title || inc.description?.slice(0, 60) || 'Sin título';
            const houseName = inc.house?.houseName || inc.houseName || 'Sin casa';
            const age = relativeAge(inc.date || inc.createdAt);
            const photos = inc.photos?.length || 0;
            const workers = inc.workers || [];
            return (
              <li key={inc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIncidence(inc)}
                  className="w-full text-left flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-turquoise-600">
                        {title}
                      </span>
                      {photos > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <Camera className="w-3 h-3" />
                          {photos}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      <Home className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{houseName}</span>
                      {age && (
                        <>
                          <span className="text-stone-300 dark:text-stone-600">·</span>
                          <span className="font-mono tabular-nums whitespace-nowrap">hace {age}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {inc.priority && (
                    <Pill variant={PRIORITY_PILL_VARIANT[inc.priority] ?? 'neutral'} dot>
                      {PRIORITY_LABEL[inc.priority] ?? inc.priority}
                    </Pill>
                  )}
                  <AssignedAvatars workers={workers} />
                  <SlaPill sla={sla} />
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                </button>
              </li>
            );
          })}
          {openIncidences.length > 5 && (
            <li>
              <Link to="/incidencias" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-1">
                +{openIncidences.length - 5} más
              </Link>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'trabajos',
      label: 'Trabajos de hoy',
      count: jobsToday.length,
      variant: 'info',
      linkTo: '/trabajos',
      linkLabel: 'Ver todos',
      emptyLabel: 'Sin trabajos programados hoy',
      subtext: jobsToday.length > 0 ? `${jobsTodayPending.length} pendiente${jobsTodayPending.length !== 1 ? 's' : ''} · ${jobsTodayCompleted.length} completado${jobsTodayCompleted.length !== 1 ? 's' : ''}` : null,
      content: jobsToday.length === 0 ? null : (
        <ul className="space-y-0.5">
          {jobsToday.slice(0, 5).map((job) => {
            const sla = getJobSlaStatus(job);
            const isDone = job.done || job.status === 'done' || job.status === 'completed';
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => navigate('/trabajos')}
                  className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                >
                  <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className={`text-sm truncate flex-1 group-hover:text-turquoise-600 ${isDone ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-900 dark:text-stone-100'}`}>
                    {job.house?.houseName || job.houseName || job.title || 'Trabajo'}
                  </span>
                  {!isDone && <SlaPill sla={sla} />}
                  {isDone && <Pill variant="resolved">Hecho</Pill>}
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                </button>
              </li>
            );
          })}
          {jobsToday.length > 5 && (
            <li>
              <Link to="/trabajos" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-1">
                +{jobsToday.length - 5} más
              </Link>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'checklists',
      label: 'Revisiones en curso',
      count: checklistsInProgress.length,
      variant: 'info',
      linkTo: '/checklists',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin revisiones activas',
      content: checklistsInProgress.length === 0 ? null : (
        <ul className="space-y-1">
          {checklistsInProgress.slice(0, 5).map((cl) => {
            const houseName = cl.house?.[0]?.houseName || cl.houseName || 'Sin casa';
            const done = Math.min(cl.done || 0, cl.total || 0);
            const total = cl.total || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const remaining = Math.max(0, total - done);
            const workers = cl.workers || [];
            const age = relativeAge(cl.date || cl.createdAt || cl.startedAt);
            const stalled = pct < 25 && age && /d|mes|año/.test(age);
            return (
              <li key={cl.id}>
                <button
                  type="button"
                  onClick={() => setSelectedChecklist(cl)}
                  className="w-full text-left flex flex-col gap-1.5 py-2 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-turquoise-600">
                          {houseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 ml-5">
                        <span className="font-mono tabular-nums">{done}/{total} ítems</span>
                        {remaining > 0 && (
                          <>
                            <span className="text-stone-300 dark:text-stone-600">·</span>
                            <span className="whitespace-nowrap">{remaining} restantes</span>
                          </>
                        )}
                        {age && (
                          <>
                            <span className="text-stone-300 dark:text-stone-600">·</span>
                            <span className="font-mono tabular-nums whitespace-nowrap">hace {age}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {stalled && <Pill variant="high" dot>Estancada</Pill>}
                    <AssignedAvatars workers={workers} unassignedLabel="Sin asignar" />
                    <span className={`text-xs font-semibold tabular-nums flex-shrink-0 ${pct >= 75 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-stone-500'}`}>
                      {pct}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                  </div>
                  <div className="quality-bar" style={{ width: '100%' }}>
                    <div
                      className="quality-bar-fill"
                      data-level={pct >= 75 ? 'good' : pct >= 40 ? 'warn' : 'bad'}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              </li>
            );
          })}
          {checklistsInProgress.length > 5 && (
            <li>
              <button type="button" onClick={() => navigate('/checklists')} className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-1">
                +{checklistsInProgress.length - 5} más
              </button>
            </li>
          )}
        </ul>
      ),
    },
    {
      key: 'jornadas',
      label: 'Jornadas abiertas',
      count: shiftsInProgress.length,
      variant: 'medium',
      linkTo: '/jornadas',
      linkLabel: 'Ver todas',
      emptyLabel: 'Sin jornadas en curso',
      content: shiftsInProgress.length === 0 ? null : (
        <ul className="space-y-0.5">
          {shiftsInProgress.slice(0, 5).map((shift) => (
            <li key={shift.id}>
              <button
                type="button"
                onClick={() => navigate('/jornadas')}
                className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
              >
                <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <span className="text-sm text-stone-900 dark:text-stone-100 truncate flex-1 group-hover:text-turquoise-600">{shift.workerName || 'Trabajador'}</span>
                <span className="text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400 flex-shrink-0">
                  {shift.firstEntry ? format(new Date(shift.firstEntry), 'HH:mm') : '—'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
              </button>
            </li>
          ))}
          {shiftsInProgress.length > 5 && (
            <li>
              <Link to="/jornadas" className="text-xs text-turquoise-600 font-medium hover:underline pl-2 inline-block mt-1">
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
        <SectionHead
          icon={Activity}
          title="Estado del día"
          right={!hasContent ? <Pill variant="resolved" dot>Todo al día</Pill> : null}
        />

        {!hasContent ? (
          <EmptyState
            icon={CheckCircle}
            title="Sin actividad pendiente"
            description="No hay incidencias, trabajos, revisiones ni jornadas abiertas"
          />
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {sections.map(({ key, label, count, variant, linkTo, linkLabel, emptyLabel, subtext, content }) => (
              <div key={key} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                      {label}
                    </span>
                    <Pill variant={count > 0 ? variant : 'neutral'}>{count}</Pill>
                  </div>
                  {count > 0 && (
                    <Link to={linkTo} className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium transition-colors flex-shrink-0">
                      {linkLabel} →
                    </Link>
                  )}
                </div>
                {content || (
                  <p className="text-xs text-stone-400 dark:text-stone-600 pl-2">{emptyLabel}</p>
                )}
                {subtext && (
                  <p className="text-[11px] text-stone-400 dark:text-stone-600 mt-1.5 pl-2">{subtext}</p>
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
        <SectionHead icon={AlertTriangle} title="Plazos en riesgo" />
        <div className="p-5 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 rounded-lg bg-[var(--color-surface-subtle)] dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const totalAtRisk = incidencesAtRisk.length + jobsAtRisk.length;

  return (
    <Card>
      <SectionHead
        icon={AlertTriangle}
        iconClassName={hasBreached ? 'text-red-500' : hasAny ? 'text-amber-500' : 'text-stone-400'}
        title="Plazos en riesgo"
        hint={hasAny ? 'SLA comprometido' : null}
        right={
          hasAny
            ? <Pill variant={hasBreached ? 'critical' : 'high'} dot={hasBreached}>{totalAtRisk}</Pill>
            : <Pill variant="resolved" dot>Al día</Pill>
        }
      />

      {!hasAny ? (
        <EmptyState
          icon={CheckCircle}
          title="Todos los plazos al día"
          description="Sin incidencias ni trabajos con SLA en riesgo"
        />
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {incidencesAtRisk.length > 0 && (
            <div className="px-5 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Incidencias</span>
                  <Pill variant="high">{incidencesAtRisk.length}</Pill>
                </div>
                <Link to="/incidencias" className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium flex-shrink-0">Ver todas →</Link>
              </div>
              <ul className="space-y-0.5">
                {incidencesAtRisk.map((inc) => {
                  const sla = getIncidenceSlaStatus(inc);
                  const title = inc.title || inc.description?.slice(0, 60) || 'Sin título';
                  const houseName = inc.house?.houseName || inc.houseName || 'Sin casa';
                  const age = relativeAge(inc.date || inc.createdAt);
                  const workers = inc.workers || [];
                  return (
                    <li key={inc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedIncidence(inc)}
                        className="w-full text-left flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-turquoise-600">
                            {title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            <Home className="w-3 h-3 text-stone-400 flex-shrink-0" />
                            <span className="truncate">{houseName}</span>
                            {age && (
                              <>
                                <span className="text-stone-300 dark:text-stone-600">·</span>
                                <span className="font-mono tabular-nums whitespace-nowrap">hace {age}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {inc.priority && (
                          <Pill variant={PRIORITY_PILL_VARIANT[inc.priority] ?? 'neutral'} dot>
                            {PRIORITY_LABEL[inc.priority] ?? inc.priority}
                          </Pill>
                        )}
                        <AssignedAvatars workers={workers} />
                        <SlaPill sla={sla} />
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {jobsAtRisk.length > 0 && (
            <div className="px-5 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Trabajos</span>
                  <Pill variant="high">{jobsAtRisk.length}</Pill>
                </div>
                <Link to="/trabajos" className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium flex-shrink-0">Ver todos →</Link>
              </div>
              <ul className="space-y-0.5">
                {jobsAtRisk.map((job) => {
                  const sla = getJobSlaStatus(job);
                  return (
                    <li key={job.id}>
                      <Link
                        to="/trabajos"
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                      >
                        <Home className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="text-sm text-stone-900 dark:text-stone-100 truncate flex-1 group-hover:text-turquoise-600">
                          {job.house?.houseName || job.houseName || job.title || 'Trabajo'}
                        </span>
                        <SlaPill sla={sla} />
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 flex-shrink-0 group-hover:text-turquoise-500 transition-colors" />
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
  const totalPending = shiftsOpen.length + jobsTodayPending.length + incidencesBreached.length;

  const columns = [
    {
      key: 'jornadas',
      label: 'Jornadas',
      count: shiftsOpen.length,
      variant: 'medium',
      emptyText: 'Todo cerrado',
      items: shiftsOpen.slice(0, 3).map((s) => ({
        id: s.id,
        to: '/jornadas',
        label: s.workerName || 'Trabajador',
        meta: s.firstEntry ? format(new Date(s.firstEntry), 'HH:mm') : '—',
      })),
      remaining: Math.max(0, shiftsOpen.length - 3),
      moreTo: '/jornadas',
    },
    {
      key: 'trabajos',
      label: 'Trabajos',
      count: jobsTodayPending.length,
      variant: 'info',
      emptyText: 'Todo completado',
      items: jobsTodayPending.slice(0, 3).map((j) => ({
        id: j.id,
        to: '/trabajos',
        label: j.house?.houseName || j.houseName || 'Trabajo',
      })),
      remaining: Math.max(0, jobsTodayPending.length - 3),
      moreTo: '/trabajos',
    },
    {
      key: 'vencidas',
      label: 'Vencidas',
      count: incidencesBreached.length,
      variant: 'critical',
      emptyText: 'Sin vencidas',
      items: incidencesBreached.slice(0, 3).map((inc) => ({
        id: inc.id,
        onClick: () => setSelectedIncidence(inc),
        label: inc.house?.houseName || inc.houseName || 'Incidencia',
      })),
      remaining: Math.max(0, incidencesBreached.length - 3),
      moreTo: '/incidencias',
    },
  ];

  return (
    <Card>
      <SectionHead
        icon={ClipboardCheck}
        iconClassName={hasAny ? 'text-red-500' : 'text-emerald-500'}
        title="Cierre del día"
        hint={hasAny ? 'Pendiente de cerrar' : 'Resumen de jornada'}
        right={
          hasAny
            ? <Pill variant="critical" dot>{totalPending} pendiente{totalPending !== 1 ? 's' : ''}</Pill>
            : <Pill variant="resolved" dot>Día cerrado</Pill>
        }
      />

      {!hasAny ? (
        <EmptyState
          icon={CheckCircle}
          title="Día cerrado correctamente"
          description="No hay jornadas abiertas, trabajos pendientes ni incidencias fuera de plazo"
        />
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {columns.map((col) => (
            <div key={col.key} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{col.label}</span>
                <Pill variant={col.count > 0 ? col.variant : 'resolved'} dot={col.count === 0}>
                  {col.count}
                </Pill>
              </div>
              {col.count === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-600">{col.emptyText}</p>
              ) : (
                <ul className="space-y-0.5">
                  {col.items.map((item) => {
                    const inner = (
                      <>
                        <span className="text-sm text-stone-700 dark:text-stone-300 truncate flex-1 group-hover:text-turquoise-600">{item.label}</span>
                        {item.meta && (
                          <span className="text-[11px] font-mono tabular-nums text-stone-400 flex-shrink-0">{item.meta}</span>
                        )}
                      </>
                    );
                    return (
                      <li key={item.id}>
                        {item.onClick ? (
                          <button
                            type="button"
                            onClick={item.onClick}
                            className="w-full text-left flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                          >
                            {inner}
                          </button>
                        ) : (
                          <Link
                            to={item.to}
                            className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors group"
                          >
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                  {col.remaining > 0 && (
                    <li>
                      <Link to={col.moreTo} className="text-[11px] text-turquoise-600 hover:underline pl-1.5 inline-block mt-0.5">
                        +{col.remaining} más
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
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

function toJsDateLoose(value) {
  if (!value) return null;
  try {
    let d = null;
    if (value.toDate && typeof value.toDate === 'function') d = value.toDate();
    else if (value.seconds != null) d = new Date(value.seconds * 1000);
    else if (value._d) d = value._d;
    else d = new Date(value);
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

function CargaOperativaWidget() {
  const [range, setRange] = useState('week');
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;

  const { data: incidences = [] } = useIncidences();
  const { data: allJobs = [] } = useJobs();
  const { data: checklists = [] } = useChecklists();

  const data = useMemo(() => {
    const buckets = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      buckets.push({
        key: format(d, 'yyyy-MM-dd'),
        label: days <= 7 ? format(d, 'EEE', { locale: es }) : format(d, 'd MMM', { locale: es }),
        revisiones: 0,
        trabajos: 0,
        incidencias: 0,
      });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    const inRange = (d) => {
      if (!d || !(d instanceof Date) || isNaN(d.getTime())) return -1;
      const k = format(d, 'yyyy-MM-dd');
      return idx.has(k) ? idx.get(k) : -1;
    };
    incidences.forEach((inc) => {
      const i = inRange(toJsDateLoose(inc.date || inc.createdAt));
      if (i >= 0) buckets[i].incidencias += 1;
    });
    allJobs.forEach((j) => {
      const i = inRange(toJsDateLoose(j.date || j.createdAt));
      if (i >= 0) buckets[i].trabajos += 1;
    });
    checklists.forEach((c) => {
      const i = inRange(toJsDateLoose(c.date));
      if (i >= 0) buckets[i].revisiones += 1;
    });
    return buckets;
  }, [incidences, allJobs, checklists, days]);

  const max = Math.max(1, ...data.map((d) => d.revisiones + d.trabajos + d.incidencias));

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">Carga operativa</h2>
          <p className="text-xs text-stone-500 mt-0.5">Revisiones, trabajos e incidencias por día</p>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5">
          {[
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mes' },
            { id: 'quarter', label: 'Trimestre' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-2.5 h-7 rounded-md text-xs font-medium transition ${
                range === opt.id
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(max * 1.1)]}
              tick={{ fontSize: 11, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: 'rgba(20,184,166,0.06)' }}
              contentStyle={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="revisiones" stackId="a" fill="#14b8a6" radius={[0, 0, 0, 0]} name="Revisiones" />
            <Bar dataKey="trabajos" stackId="a" fill="#0F2C4D" name="Trabajos" />
            <Bar dataKey="incidencias" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} name="Incidencias" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#14b8a6' }} />Revisiones</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#0F2C4D' }} />Trabajos</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#f97316' }} />Incidencias</span>
        </div>
      </div>
    </Card>
  );
}

function CarteraWidget() {
  const { data: houses = [] } = useHouses();
  const { data: incidences = [] } = useIncidences();
  const { data: allJobs = [] } = useJobs();

  const stats = useMemo(() => {
    const total = houses.length;
    let conIncidencias = 0;
    let conTrabajos = 0;
    const housesWithOpenInc = new Set(
      incidences
        .filter((i) => !i.done)
        .map((i) => i.houseId || i.house?.id || i.house?.[0]?.id)
        .filter(Boolean)
    );
    const housesWithActiveJobs = new Set(
      allJobs
        .filter((j) => j.status !== 'completed' && j.status !== 'done' && j.status !== 'cancelled')
        .map((j) => j.houseId)
        .filter(Boolean)
    );
    houses.forEach((h) => {
      if (housesWithOpenInc.has(h.id)) conIncidencias += 1;
      else if (housesWithActiveJobs.has(h.id)) conTrabajos += 1;
    });
    const tranquilas = total - conIncidencias - conTrabajos;
    return { total, conIncidencias, conTrabajos, tranquilas };
  }, [houses, incidences, allJobs]);

  const chartData = [
    { name: 'Tranquilas', value: stats.tranquilas, color: '#14b8a6' },
    { name: 'En trabajos', value: stats.conTrabajos, color: '#0F2C4D' },
    { name: 'Con incidencias', value: stats.conIncidencias, color: '#f97316' },
  ].filter((d) => d.value > 0);

  const pct =
    stats.total > 0 ? Math.round((stats.tranquilas / stats.total) * 100) : 0;

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[var(--border-soft)]">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100">Cartera</h2>
        <p className="text-xs text-stone-500 mt-0.5">Estado de las {stats.total} propiedades</p>
      </div>
      <div className="p-5 flex items-center gap-5">
        <div className="relative w-32 h-32 flex-shrink-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full bg-stone-100 dark:bg-stone-800" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-none tabular-nums">{pct}%</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 mt-1">tranquilas</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2 min-w-0">
          {[
            { label: 'Tranquilas', value: stats.tranquilas, color: '#14b8a6' },
            { label: 'En trabajos', value: stats.conTrabajos, color: '#0F2C4D' },
            { label: 'Con incidencias', value: stats.conIncidencias, color: '#f97316' },
          ].map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: row.color }} />
                <span className="text-sm text-stone-600 dark:text-stone-300 truncate">{row.label}</span>
              </span>
              <span className="font-mono tabular-nums text-sm font-medium text-stone-900 dark:text-stone-100">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

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
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Panel"
        subtitle={(() => {
          const day = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
          return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${stats.totalRegisteredWorkers || 0} trabajadores registrados`;
        })()}
        actions={
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Actualizar
          </Button>
        }
      />

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

      {/* ——— Carga operativa + Cartera ——— */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CargaOperativaWidget />
        </div>
        <CarteraWidget />
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
