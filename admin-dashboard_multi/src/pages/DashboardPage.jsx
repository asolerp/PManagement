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
import { useChecklists, useIncidences, useJobs } from '@/hooks/useFirestore';
import { useNavigate, Link } from 'react-router-dom';
import { getIncidenceSlaStatus, getJobSlaStatus } from '@/utils/sla';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import ShiftDetailPanel from '@/components/ShiftDetailPanel';
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
    primary: 'bg-turquoise-50 text-turquoise-600',
    secondary: 'bg-turquoise-100/80 text-turquoise-700',
    accent: 'bg-turquoise-50 text-turquoise-600',
    warning: 'bg-amber-50 text-amber-600',
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
        <div className="w-16 h-16 rounded-2xl bg-turquoise-50 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-turquoise-500" />
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
        <div className="w-16 h-16 rounded-2xl bg-turquoise-50 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-turquoise-500" />
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
  at_risk: 'bg-amber-50 text-amber-700',
  breached: 'bg-red-50 text-red-700',
};

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
  const isLoading = loadingIncidences || loadingJobs || loadingChecklists || loadingShifts;

  if (isLoading) {
    return (
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-turquoise-50">
            <Activity className="w-5 h-5 text-turquoise-600" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">Estado del día</h2>
        </div>
        <div className="p-6 text-center text-stone-500 text-sm">Cargando...</div>
      </Card>
    );
  }

  const hasContent = openIncidences.length > 0 || jobsToday.length > 0 || checklistsInProgress.length > 0 || shiftsInProgress.length > 0;

  return (
    <>
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-turquoise-50">
              <Activity className="w-5 h-5 text-turquoise-600" />
            </div>
            <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">Estado del día</h2>
          </div>
          {!hasContent && (
            <span className="text-sm text-stone-500">Sin actividad activa</span>
          )}
        </div>

        {!hasContent ? (
          <div className="p-6 sm:p-8 text-center">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-turquoise-500 mx-auto mb-2" />
            <p className="text-stone-500 text-sm">No hay incidencias abiertas, trabajos de hoy, revisiones en curso ni jornadas abiertas</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {/* Incidencias abiertas */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-turquoise-600" />
                  Incidencias abiertas
                </h3>
                {openIncidences.length > 0 && (
                  <Link to="/incidencias" className="text-xs font-medium text-turquoise-600 hover:underline">Ver todas</Link>
                )}
              </div>
              {openIncidences.length === 0 ? (
                <p className="text-xs text-gray-400">Ninguna</p>
              ) : (
                <ul className="space-y-1.5">
                  {openIncidences.slice(0, 6).map((inc) => {
                    const sla = getIncidenceSlaStatus(inc);
                    return (
                      <li key={inc.id}>
                        <button
                          type="button"
                          onClick={() => navigate('/incidencias')}
                          className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate flex-1">{inc.house?.houseName || inc.houseName || 'Sin casa'}</span>
                          {sla && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${SLA_BADGE_CLASS[sla.status] || ''}`}>
                              {sla.label}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                  {openIncidences.length > 6 && (
                    <li>
                      <Link to="/incidencias" className="text-xs text-turquoise-600 font-medium hover:underline pl-2">
                        +{openIncidences.length - 6} más
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Trabajos de hoy */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-turquoise-600" />
                  Trabajos de hoy
                </h3>
                {jobsToday.length > 0 && (
                  <Link to="/trabajos" className="text-xs font-medium text-turquoise-600 hover:underline">Ver todos</Link>
                )}
              </div>
              {jobsToday.length === 0 ? (
                <p className="text-xs text-gray-400">Ninguno</p>
              ) : (
                <ul className="space-y-1.5">
                  {jobsToday.slice(0, 6).map((job) => {
                    const sla = getJobSlaStatus(job);
                    const isDone = job.done || job.status === 'done' || job.status === 'completed';
                    return (
                      <li key={job.id}>
                        <button
                          type="button"
                          onClick={() => navigate('/trabajos')}
                          className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate flex-1">{job.house?.houseName || job.houseName || job.title || 'Trabajo'}</span>
                          {!isDone && sla && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${SLA_BADGE_CLASS[sla.status] || ''}`}>
                              {sla.label}
                            </span>
                          )}
                          <span className={`text-[10px] flex-shrink-0 ${isDone ? 'text-green-600' : 'text-amber-600'}`}>
                            {isDone ? 'Hecho' : 'Pend.'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                  {jobsToday.length > 6 && (
                    <li>
                      <Link to="/trabajos" className="text-xs text-turquoise-600 font-medium hover:underline pl-2">
                        +{jobsToday.length - 6} más
                      </Link>
                    </li>
                  )}
                </ul>
              )}
              {jobsToday.length > 0 && (
                <p className="text-[10px] text-gray-500 mt-1 pl-2">
                  {jobsTodayPending.length} pendientes, {jobsTodayCompleted.length} completados
                </p>
              )}
            </div>

            {/* Revisiones en curso (checklists) */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-turquoise-600" />
                  Revisiones en curso
                </h3>
                {checklistsInProgress.length > 0 && (
                  <Link to="/checklists" className="text-xs font-medium text-turquoise-600 hover:underline">Ver todas</Link>
                )}
              </div>
              {checklistsInProgress.length === 0 ? (
                <p className="text-xs text-gray-400">Ninguna</p>
              ) : (
                <ul className="space-y-1.5">
                  {checklistsInProgress.slice(0, 6).map((cl) => {
                    const houseName = cl.house?.[0]?.houseName || cl.houseName || 'Sin casa';
                    const done = cl.done || 0;
                    const total = cl.total || 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <li key={cl.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedChecklist(cl)}
                          className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate flex-1">{houseName}</span>
                          <span className="text-xs text-turquoise-600 font-medium flex-shrink-0">{done}/{total} ({pct}%)</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                  {checklistsInProgress.length > 6 && (
                    <li>
                      <button type="button" onClick={() => navigate('/checklists')} className="text-xs text-turquoise-600 font-medium hover:underline pl-2">
                        +{checklistsInProgress.length - 6} más
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Jornadas en curso */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-turquoise-600" />
                  Jornadas en curso
                </h3>
                {shiftsInProgress.length > 0 && (
                  <Link to="/jornadas" className="text-xs font-medium text-turquoise-600 hover:underline">Ver todas</Link>
                )}
              </div>
              {shiftsInProgress.length === 0 ? (
                <p className="text-xs text-gray-400">Ninguna</p>
              ) : (
                <ul className="space-y-1.5">
                  {shiftsInProgress.slice(0, 6).map((shift) => (
                    <li key={shift.id}>
                      <button
                        type="button"
                        onClick={() => navigate('/jornadas')}
                        className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-900 truncate flex-1">{shift.workerName || 'Trabajador'}</span>
                        <span className="text-[10px] text-gray-500">
                          {shift.firstEntry ? format(new Date(shift.firstEntry), 'HH:mm') : '—'} entrada
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                  {shiftsInProgress.length > 6 && (
                    <li>
                      <Link to="/jornadas" className="text-xs text-turquoise-600 font-medium hover:underline pl-2">
                        +{shiftsInProgress.length - 6} más
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
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

/** Widget: solo incidencias y trabajos con SLA at_risk o breached. Enlaces a listado. */
function SlaEnRiesgoWidget() {
  const today = todayStr();
  const { data: openIncidences = [], isLoading: loadingIncidences } = useIncidences({ done: false });
  const { data: allJobs = [], isLoading: loadingJobs } = useJobs();

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

  if (isLoading) {
    return (
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">Plazos en riesgo hoy</h2>
        </div>
        <div className="p-6 text-center text-stone-500 text-sm">Cargando...</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">Plazos en riesgo hoy</h2>
        </div>
        {hasAny && (
          <span className="text-xs sm:text-sm text-amber-600 font-medium">
            {incidencesAtRisk.length + jobsAtRisk.length} en riesgo o incumplidos
          </span>
        )}
      </div>

      {!hasAny ? (
        <div className="p-6 sm:p-8 text-center">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-turquoise-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Ninguna incidencia ni trabajo con plazo en riesgo o fuera de plazo</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {incidencesAtRisk.length > 0 && (
            <div className="px-5 py-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-turquoise-600" />
                Incidencias
              </h3>
              <ul className="space-y-1.5">
                {incidencesAtRisk.map((inc) => {
                  const sla = getIncidenceSlaStatus(inc);
                  return (
                    <li key={inc.id}>
                      <Link
                        to="/incidencias"
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate flex-1 group-hover:text-turquoise-600">
                          {inc.house?.houseName || inc.houseName || 'Sin casa'}
                        </span>
                        {sla && (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${SLA_BADGE_CLASS[sla.status] || ''}`}>
                            {sla.label}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link to="/incidencias" className="text-xs font-medium text-turquoise-600 hover:underline mt-1.5 inline-block">
                Ver todas las incidencias
              </Link>
            </div>
          )}
          {jobsAtRisk.length > 0 && (
            <div className="px-5 py-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-turquoise-600" />
                Trabajos
              </h3>
              <ul className="space-y-1.5">
                {jobsAtRisk.map((job) => {
                  const sla = getJobSlaStatus(job);
                  return (
                    <li key={job.id}>
                      <Link
                        to="/trabajos"
                        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate flex-1 group-hover:text-turquoise-600">
                          {job.house?.houseName || job.houseName || job.title || 'Trabajo'}
                        </span>
                        {sla && (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${SLA_BADGE_CLASS[sla.status] || ''}`}>
                            {sla.label}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link to="/trabajos" className="text-xs font-medium text-turquoise-600 hover:underline mt-1.5 inline-block">
                Ver todos los trabajos
              </Link>
            </div>
          )}
        </div>
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
    <Card>
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-turquoise-50">
            <ClipboardCheck className="w-5 h-5 text-turquoise-600" />
          </div>
          <h2 className="font-heading text-base sm:text-lg font-semibold text-stone-900">Cierre del día</h2>
        </div>
        {hasAny && (
          <span className="text-xs sm:text-sm text-amber-600 font-medium">
            {shiftsOpen.length + jobsTodayPending.length + incidencesBreached.length} pendiente(s)
          </span>
        )}
      </div>
      {!hasAny ? (
        <div className="p-6 sm:p-8 text-center">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-turquoise-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Todo cerrado: no hay jornadas abiertas, trabajos pendientes ni incidencias fuera de plazo</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {shiftsOpen.length > 0 && (
            <div className="px-5 py-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Jornadas sin salida</h3>
              <ul className="space-y-1">
                {shiftsOpen.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link to="/jornadas" className="text-sm text-turquoise-600 hover:underline">
                      {s.workerName || 'Trabajador'} — entrada {s.firstEntry ? format(new Date(s.firstEntry), 'HH:mm') : '—'}
                    </Link>
                  </li>
                ))}
                {shiftsOpen.length > 5 && (
                  <li><Link to="/jornadas" className="text-xs text-turquoise-600 hover:underline">+{shiftsOpen.length - 5} más</Link></li>
                )}
              </ul>
            </div>
          )}
          {jobsTodayPending.length > 0 && (
            <div className="px-5 py-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Trabajos de hoy pendientes</h3>
              <ul className="space-y-1">
                {jobsTodayPending.slice(0, 5).map((j) => (
                  <li key={j.id}>
                    <Link to="/trabajos" className="text-sm text-turquoise-600 hover:underline">
                      {j.house?.houseName || j.houseName || 'Trabajo'}
                    </Link>
                  </li>
                ))}
                {jobsTodayPending.length > 5 && (
                  <li><Link to="/trabajos" className="text-xs text-turquoise-600 hover:underline">+{jobsTodayPending.length - 5} más</Link></li>
                )}
              </ul>
            </div>
          )}
          {incidencesBreached.length > 0 && (
            <div className="px-5 py-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Incidencias fuera de plazo</h3>
              <ul className="space-y-1">
                {incidencesBreached.slice(0, 5).map((inc) => (
                  <li key={inc.id}>
                    <Link to="/incidencias" className="text-sm text-turquoise-600 hover:underline">
                      {inc.house?.houseName || inc.houseName || inc.title || 'Incidencia'}
                    </Link>
                  </li>
                ))}
                {incidencesBreached.length > 5 && (
                  <li><Link to="/incidencias" className="text-xs text-turquoise-600 hover:underline">+{incidencesBreached.length - 5} más</Link></li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
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
      <section className="space-y-3">
        <h2 className="font-heading text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Actividad y alertas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EstadoDelDiaPanel />
          <SlaEnRiesgoWidget />
        </div>
        <CierreDelDiaSection />
      </section>

      {/* ——— Sección: Jornadas y trabajadores ——— */}
      <section className="space-y-3">
        <h2 className="font-heading text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Jornadas y trabajadores
        </h2>

        {!shiftsLoading && workerStats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center gap-2">
                <div className="p-2 rounded-xl bg-turquoise-50">
                  <TrendingUp className="w-5 h-5 text-turquoise-600" />
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
                <div className="p-2 rounded-xl bg-turquoise-50">
                  <Users className="w-5 h-5 text-turquoise-600" />
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
                <div className="p-2 rounded-xl bg-turquoise-50">
                  <Users className="w-5 h-5 text-turquoise-600" />
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
