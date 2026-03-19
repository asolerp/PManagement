import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  ChevronUp,
  ChevronDown,
  Home,
  User,
  Clock,
  Briefcase,
  Loader2,
  Route,
  Download,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import CuadranteMap from '@/components/CuadranteMap';
import {
  useQuadrantsByDate,
  useQuadrantJobs,
  useUpdateQuadrantJobsOrder,
  useOptimizeRoute,
  useCreateQuadrant,
  useAddQuadrantJob,
  useProposeQuadrantAssignment,
  useDeleteQuadrant,
  useDeleteQuadrantJob,
  useHouses,
  useWorkersFirestore,
} from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

function toDate(value) {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (value.toDate && typeof value.toDate === 'function') return value.toDate();
  if (value._seconds != null) return new Date(value._seconds * 1000);
  if (typeof value === 'object' && value.seconds != null) return new Date(value.seconds * 1000);
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value + 'T12:00:00');
  return new Date(value);
}

function formatTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, 'HH:mm', { locale: es });
}

function getWorkerId(job) {
  if (job.worker?.id) return job.worker.id;
  if (job.workersId?.[0]) return job.workersId[0];
  return null;
}

function getWorkerName(job, workersById) {
  const id = getWorkerId(job);
  if (!id) return 'Sin asignar';
  const w = workersById[id];
  if (!w) return id;
  return [w.firstName, w.lastName].filter(Boolean).join(' ') || w.name || id;
}

export default function CuadrantePage() {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => format(today, 'yyyy-MM-dd'));

  const dateObj = useMemo(
    () => (selectedDate ? new Date(selectedDate + 'T12:00:00') : null),
    [selectedDate]
  );

  const { data: quadrants = [], isLoading: loadingQuadrants, refetch: refetchQuadrants } = useQuadrantsByDate(dateObj);
  const quadrant = quadrants[0] ?? null;
  const { data: quadrantJobs = [], isLoading: loadingJobs } = useQuadrantJobs(quadrant?.id ?? null);
  const { data: houses = [] } = useHouses();
  const { data: workers = [] } = useWorkersFirestore();
  const updateOrder = useUpdateQuadrantJobsOrder();
  const optimizeRoute = useOptimizeRoute();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  const queryClient = useQueryClient();
  const createQuadrant = useCreateQuadrant();
  const addQuadrantJob = useAddQuadrantJob();
  const proposeAssignment = useProposeQuadrantAssignment();
  const deleteQuadrantMutation = useDeleteQuadrant();
  const deleteQuadrantJobMutation = useDeleteQuadrantJob();
  const [optimizeError, setOptimizeError] = useState(null);
  const [createQuadrantError, setCreateQuadrantError] = useState(null);
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);
  const [deleteQuadrantConfirmOpen, setDeleteQuadrantConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [addJobForm, setAddJobForm] = useState({
    houseId: '',
    workerId: '',
    startTime: '09:00',
    endTime: '10:00',
  });
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [proposalResult, setProposalResult] = useState(null);
  const [proposalForm, setProposalForm] = useState({
    houseIds: [],
    workerIds: [],
    houseDurations: {},
    workerWorkHours: {},
  });
  const [applyingProposal, setApplyingProposal] = useState(false);

  const housesById = useMemo(
    () => Object.fromEntries((houses || []).map((h) => [h.id, h])),
    [houses]
  );
  const workersById = useMemo(
    () => Object.fromEntries((workers || []).map((w) => [w.id, w])),
    [workers]
  );

  const byWorker = useMemo(() => {
    const map = new Map();
    for (const job of quadrantJobs) {
      const workerId = getWorkerId(job) ?? '_sin_asignar';
      if (!map.has(workerId)) map.set(workerId, []);
      map.get(workerId).push(job);
    }
    return map;
  }, [quadrantJobs]);

  const summaryByWorker = useMemo(() => {
    const out = {};
    byWorker.forEach((jobs, workerId) => {
      const sortedByStart = [...jobs].sort((a, b) => {
        const ta = toDate(a.startHour)?.getTime() ?? 0;
        const tb = toDate(b.startHour)?.getTime() ?? 0;
        return ta - tb;
      });
      const firstStart = sortedByStart.reduce((acc, j) => {
        const t = toDate(j.startHour)?.getTime();
        return t != null && (acc == null || t < acc) ? t : acc;
      }, null);
      const lastEnd = sortedByStart.reduce((acc, j) => {
        const t = toDate(j.endHour)?.getTime();
        return t != null && (acc == null || t > acc) ? t : acc;
      }, null);
      // Huecos: entre fin de una franja e inicio de la siguiente (> 0 min)
      // Solapamientos: inicio siguiente < fin anterior
      let gaps = 0;
      let overlaps = 0;
      for (let i = 0; i < sortedByStart.length - 1; i++) {
        const endCur = toDate(sortedByStart[i].endHour)?.getTime();
        const startNext = toDate(sortedByStart[i + 1].startHour)?.getTime();
        if (endCur != null && startNext != null) {
          const diffMin = (startNext - endCur) / (60 * 1000);
          if (diffMin > 0) gaps += 1;
          else if (diffMin < 0) overlaps += 1;
        }
      }
      out[workerId] = {
        count: jobs.length,
        firstSlot: firstStart != null ? format(new Date(firstStart), 'HH:mm', { locale: es }) : '—',
        lastSlot: lastEnd != null ? format(new Date(lastEnd), 'HH:mm', { locale: es }) : '—',
        gaps,
        overlaps,
      };
    });
    return out;
  }, [byWorker]);

  const isLoading = loadingQuadrants || (quadrant && loadingJobs);
  const hasQuadrant = !!quadrant;
  const hasJobs = quadrantJobs.length > 0;

  const handleMove = (workerId, jobIndex, direction) => {
    const jobs = byWorker.get(workerId);
    if (!jobs || !quadrant) return;
    const newIndex = direction === 'up' ? jobIndex - 1 : jobIndex + 1;
    if (newIndex < 0 || newIndex >= jobs.length) return;
    const reordered = [...jobs];
    const a = reordered[jobIndex];
    reordered[jobIndex] = reordered[newIndex];
    reordered[newIndex] = a;
    const updates = reordered.map((j, i) => ({ jobId: j.id, routeOrder: i }));
    updateOrder.mutate({ quadrantId: quadrant.id, updates });
  };

  const workerOrder = useMemo(() => {
    const ids = Array.from(byWorker.keys()).filter((k) => k !== '_sin_asignar');
    const firstJob = (wid) => byWorker.get(wid)?.[0];
    ids.sort((a, b) => {
      const ta = toDate(firstJob(a)?.startHour)?.getTime() ?? 0;
      const tb = toDate(firstJob(b)?.startHour)?.getTime() ?? 0;
      return ta - tb;
    });
    if (byWorker.has('_sin_asignar')) ids.push('_sin_asignar');
    return ids;
  }, [byWorker]);

  const globalDayRows = useMemo(() => {
    return quadrantJobs
      .map((job) => {
        const house = job.houseId ? housesById[job.houseId] : null;
        const houseName =
          house?.houseName || job.house?.houseName || job.house?.[0]?.houseName || 'Casa';
        return {
          job,
          houseName,
          houseId: job.houseId,
          workerName: getWorkerName(job, workersById),
          startTime: formatTime(job.startHour),
          endTime: formatTime(job.endHour),
          startSort: toDate(job.startHour)?.getTime() ?? 0,
        };
      })
      .sort((a, b) => a.startSort - b.startSort);
  }, [quadrantJobs, housesById, workersById]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#126D9B]" />
            Cuadrante del día
          </h1>
          <p className="text-gray-500 mt-1">
            Vista por trabajador, casas y franjas horarias. Reordena el orden de ruta si lo necesitas.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          {hasQuadrant && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = [
                  ['Trabajador', 'Casa', 'Inicio', 'Fin'].join(','),
                  ...workerOrder.flatMap((workerId) => {
                    const jobs = byWorker.get(workerId) || [];
                    const firstJob = jobs[0];
                    const workerName =
                      workerId === '_sin_asignar'
                        ? 'Sin asignar'
                        : getWorkerName(firstJob, workersById);
                    return jobs.map((job) => {
                      const house = job.houseId ? housesById[job.houseId] : null;
                      const houseName =
                        house?.houseName ||
                        job.house?.houseName ||
                        job.house?.[0]?.houseName ||
                        'Casa';
                      return [
                        `"${(workerName || '').replace(/"/g, '""')}"`,
                        `"${(houseName || '').replace(/"/g, '""')}"`,
                        formatTime(job.startHour),
                        formatTime(job.endHour),
                      ].join(',');
                    });
                  }),
                ];
                const csv = rows.join('\n');
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cuadrante-${selectedDate}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#126D9B]" />
        </div>
      )}

      {!isLoading && !hasQuadrant && (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay cuadrante para esta fecha</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Crea un cuadrante para organizar los trabajos del día y luego añade casa, trabajador y franja horaria.
            </p>
            {!companyId && (
              <p className="text-amber-600 text-sm mb-3">
                No se puede crear: tu usuario no tiene empresa asignada. Contacta con el administrador.
              </p>
            )}
            {createQuadrantError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 text-left max-w-md mx-auto flex items-center justify-between gap-2">
                <span>{createQuadrantError}</span>
                <button
                  type="button"
                  onClick={() => setCreateQuadrantError(null)}
                  className="text-red-500 hover:text-red-700 font-medium shrink-0"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setCreateQuadrantError(null);
                  setProposalResult(null);
                  setProposalForm({
                    houseIds: [],
                    workerIds: [],
                    houseDurations: {},
                    workerWorkHours: {},
                  });
                  setProposeModalOpen(true);
                }}
                disabled={!dateObj || !companyId || !houses?.length || !workers?.length}
              >
                <Route className="w-4 h-4 mr-2" />
                Crear cuadrante del día
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && hasQuadrant && (
        <>
          <Card>
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong>{' '}
                  {format(toDate(quadrant.date) || dateObj, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {quadrantJobs.length} trabajo{quadrantJobs.length !== 1 ? 's' : ''} ·{' '}
                  {workerOrder.length} trabajador{workerOrder.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddJobForm({ houseId: '', workerId: '', startTime: '09:00', endTime: '10:00' });
                    setAddJobModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir trabajo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteQuadrantConfirmOpen(true)}
                  disabled={deleteQuadrantMutation.isPending}
                >
                  {deleteQuadrantMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Eliminar cuadrante
                </Button>
              </div>
            </CardContent>
          </Card>

          {!hasJobs && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">Aún no hay trabajos en este cuadrante.</p>
                <p className="text-gray-400 text-xs mt-1">Añade el primero con el botón «Añadir trabajo».</p>
              </CardContent>
            </Card>
          )}

          {optimizeError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
              <span>{optimizeError}</span>
              <button
                type="button"
                onClick={() => setOptimizeError(null)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Cerrar
              </button>
            </div>
          )}

          {hasJobs && (
          <>
          {/* Vista global del día: todas las paradas en orden cronológico */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900">Vista global del día</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Todas las paradas ordenadas por hora (casa, trabajador, franja).
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-gray-600">
                      <th className="px-4 py-2 font-medium whitespace-nowrap">Hora inicio</th>
                      <th className="px-4 py-2 font-medium whitespace-nowrap">Hora fin</th>
                      <th className="px-4 py-2 font-medium">Casa</th>
                      <th className="px-4 py-2 font-medium">Trabajador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalDayRows.map((row) => (
                      <tr key={row.job.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{row.startTime}</td>
                        <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{row.endTime}</td>
                        <td className="px-4 py-2">
                          {row.houseId ? (
                            <Link
                              to={`/casas/${row.houseId}`}
                              className="text-[#126D9B] hover:underline font-medium"
                            >
                              {row.houseName}
                            </Link>
                          ) : (
                            <span className="text-gray-600">{row.houseName}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{row.workerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Resumen del cuadrante por trabajador */}
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900">Resumen del cuadrante</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Por trabajador: número de casas, primera y última franja, y alertas de huecos o solapamientos.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500">
                      <th className="px-5 py-3 font-medium">Trabajador</th>
                      <th className="px-5 py-3 font-medium">Casas</th>
                      <th className="px-5 py-3 font-medium">Primera entrada</th>
                      <th className="px-5 py-3 font-medium">Última salida</th>
                      <th className="px-5 py-3 font-medium">Alertas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerOrder.map((workerId) => {
                      const jobs = byWorker.get(workerId) || [];
                      const summary = summaryByWorker[workerId] || {};
                      const firstJob = jobs[0];
                      const workerName =
                        workerId === '_sin_asignar'
                          ? 'Sin asignar'
                          : getWorkerName(firstJob, workersById);
                      const hasAlerts = (summary.gaps ?? 0) > 0 || (summary.overlaps ?? 0) > 0;
                      return (
                        <tr key={workerId} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-gray-900">{workerName}</td>
                          <td className="px-5 py-3 text-gray-600">{summary.count ?? 0}</td>
                          <td className="px-5 py-3 text-gray-600">{summary.firstSlot ?? '—'}</td>
                          <td className="px-5 py-3 text-gray-600">{summary.lastSlot ?? '—'}</td>
                          <td className="px-5 py-3">
                            {hasAlerts ? (
                              <span className="text-amber-600 text-xs">
                                {(summary.gaps ?? 0) > 0 && `${summary.gaps} hueco(s)`}
                                {(summary.gaps ?? 0) > 0 && (summary.overlaps ?? 0) > 0 && ' · '}
                                {(summary.overlaps ?? 0) > 0 && `${summary.overlaps} solapamiento(s)`}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workerOrder.map((workerId) => {
              const jobs = byWorker.get(workerId) || [];
              const summary = summaryByWorker[workerId] || {};
              const firstJob = jobs[0];
              const workerName =
                workerId === '_sin_asignar'
                  ? 'Sin asignar'
                  : getWorkerName(firstJob, workersById);

              return (
                <Card key={workerId} className="flex flex-col">
                  <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="p-1.5 rounded-md bg-[#126D9B]/10 text-[#126D9B] shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="font-semibold text-gray-900 text-sm truncate">{workerName}</h2>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                            <span>{summary.count} casa{summary.count !== 1 ? 's' : ''}</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {summary.firstSlot} – {summary.lastSlot}
                            </span>
                            {(summary.gaps > 0 || summary.overlaps > 0) && (
                              <span className="text-amber-600 text-xs">
                                {[summary.gaps > 0 && `${summary.gaps} hueco(s)`, summary.overlaps > 0 && `${summary.overlaps} solap.`].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {workerId !== '_sin_asignar' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="!px-1.5 !py-1 h-7"
                              disabled={optimizeRoute.isPending}
                              onClick={() => {
                                setOptimizeError(null);
                                optimizeRoute.mutate(
                                  { quadrantId: quadrant.id, workerId },
                                  {
                                    onSuccess: () => setOptimizeError(null),
                                    onError: (err) =>
                                      setOptimizeError(err?.message || 'Error al optimizar ruta'),
                                  }
                                );
                              }}
                              title="Optimizar ruta por proximidad"
                            >
                              {optimizeRoute.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Route className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                          {workerId !== '_sin_asignar' && (
                            <Link
                              to={`/trabajadores/${workerId}`}
                              className="text-xs text-[#126D9B] hover:underline whitespace-nowrap"
                            >
                              Perfil
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-100 overflow-auto flex-1 min-h-0">
                      {jobs.map((job, index) => {
                        const house = job.houseId ? housesById[job.houseId] : null;
                        const houseName =
                          house?.houseName ||
                          job.house?.houseName ||
                          job.house?.[0]?.houseName ||
                          'Casa';

                        return (
                          <li
                            key={job.id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50/50"
                          >
                            <div className="flex flex-col gap-0 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMove(workerId, index, 'up')}
                                disabled={index === 0 || updateOrder.isPending}
                                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none text-gray-500"
                                aria-label="Subir"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(workerId, index, 'down')}
                                disabled={index === jobs.length - 1 || updateOrder.isPending}
                                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none text-gray-500"
                                aria-label="Bajar"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-xs font-medium text-gray-400 w-4 shrink-0">{index + 1}.</span>
                            <span className="text-xs text-gray-600 shrink-0 whitespace-nowrap">
                              {formatTime(job.startHour)}–{formatTime(job.endHour)}
                            </span>
                            <div className="flex-1 min-w-0 truncate">
                              {job.houseId ? (
                                <Link
                                  to={`/casas/${job.houseId}`}
                                  className="text-xs text-[#126D9B] hover:underline font-medium truncate block"
                                >
                                  {houseName}
                                </Link>
                              ) : (
                                <span className="text-xs text-gray-500 truncate block">{houseName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const start = toDate(job.startHour);
                                  const end = toDate(job.endHour);
                                  setAddJobForm({
                                    houseId: job.houseId || '',
                                    workerId: getWorkerId(job) || '',
                                    startTime: start ? format(start, 'HH:mm') : '09:00',
                                    endTime: end ? format(end, 'HH:mm') : '10:00',
                                  });
                                  setEditingJob(job);
                                }}
                                className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-[#126D9B]"
                                title="Editar"
                                aria-label="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setJobToDelete(job)}
                                className="p-1.5 rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                                title="Quitar"
                                aria-label="Quitar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {jobs.length > 0 && (
                      <div className="px-3 py-2 border-t border-gray-100 shrink-0">
                        <p className="text-xs text-gray-500 mb-1">Ruta</p>
                        <CuadranteMap jobs={jobs} housesById={housesById} compact />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </>
          )}
        </>
      )}

      {/* Modal Añadir trabajo al cuadrante */}
      {addJobModalOpen && quadrant && (
        <Modal
          open={addJobModalOpen}
          onClose={() => setAddJobModalOpen(false)}
          title="Añadir trabajo al cuadrante"
          maxWidth="max-w-md"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const worker = workersById[addJobForm.workerId];
              if (!addJobForm.houseId || !worker) return;
              const [sh, sm] = addJobForm.startTime.split(':').map(Number);
              const [eh, em] = addJobForm.endTime.split(':').map(Number);
              const startHour = new Date(dateObj);
              startHour.setHours(sh, sm, 0, 0);
              const endHour = new Date(dateObj);
              endHour.setHours(eh, em, 0, 0);
              addQuadrantJob.mutate(
                {
                  quadrantId: quadrant.id,
                  payload: {
                    houseId: addJobForm.houseId,
                    worker,
                    startHour,
                    endHour,
                    date: dateObj,
                  },
                },
                {
                  onSuccess: () => {
                    setAddJobModalOpen(false);
                    setAddJobForm({ houseId: '', workerId: '', startTime: '09:00', endTime: '10:00' });
                  },
                }
              );
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Casa</label>
              <select
                required
                value={addJobForm.houseId}
                onChange={(e) => setAddJobForm((f) => ({ ...f, houseId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#126D9B] focus:ring-1 focus:ring-[#126D9B]"
              >
                <option value="">Selecciona una casa</option>
                {(houses || []).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.houseName || h.address || h.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
              <select
                required
                value={addJobForm.workerId}
                onChange={(e) => setAddJobForm((f) => ({ ...f, workerId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#126D9B] focus:ring-1 focus:ring-[#126D9B]"
              >
                <option value="">Selecciona un trabajador</option>
                {(workers || []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {[w.firstName, w.lastName].filter(Boolean).join(' ') || w.name || w.email || w.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <Input
                  type="time"
                  value={addJobForm.startTime}
                  onChange={(e) => setAddJobForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <Input
                  type="time"
                  value={addJobForm.endTime}
                  onChange={(e) => setAddJobForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddJobModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addQuadrantJob.isPending}>
                {addQuadrantJob.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Añadiendo…
                  </>
                ) : (
                  'Añadir'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Confirmar eliminar cuadrante */}
      {deleteQuadrantConfirmOpen && quadrant && (
        <Modal
          open={deleteQuadrantConfirmOpen}
          onClose={() => !deleteQuadrantMutation.isPending && setDeleteQuadrantConfirmOpen(false)}
          title="Eliminar cuadrante"
          maxWidth="max-w-sm"
        >
          <p className="text-sm text-gray-600 mb-4">
            Se eliminará el cuadrante del día y todos sus trabajos. Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteQuadrantConfirmOpen(false)}
              disabled={deleteQuadrantMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuadrantMutation.isPending}
              onClick={() => {
                const quadrantIdToDelete = quadrant.id;
                deleteQuadrantMutation.mutate(quadrantIdToDelete, {
                  onSuccess: async () => {
                    setDeleteQuadrantConfirmOpen(false);
                    if (companyId && selectedDate) {
                      await queryClient.invalidateQueries({ queryKey: ['quadrants', companyId, selectedDate] });
                      await queryClient.refetchQueries({ queryKey: ['quadrants', companyId, selectedDate] });
                    }
                  },
                });
              }}
            >
              {deleteQuadrantMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar quitar trabajo del cuadrante */}
      {jobToDelete && quadrant && (
        <Modal
          open={!!jobToDelete}
          onClose={() => !deleteQuadrantJobMutation.isPending && setJobToDelete(null)}
          title="Quitar trabajo del cuadrante"
          maxWidth="max-w-sm"
        >
          <p className="text-sm text-gray-600 mb-4">
            ¿Quitar esta casa del cuadrante para este trabajador? El trabajo se eliminará del día.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setJobToDelete(null)}
              disabled={deleteQuadrantJobMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuadrantJobMutation.isPending}
              onClick={() => {
                deleteQuadrantJobMutation.mutate(
                  {
                    quadrantId: quadrant.id,
                    jobId: jobToDelete.id,
                    job: {
                      houseId: jobToDelete.houseId,
                      worker: jobToDelete.worker,
                      workersId: jobToDelete.workersId,
                    },
                  },
                  { onSuccess: () => setJobToDelete(null) }
                );
              }}
            >
              {deleteQuadrantJobMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Quitar
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Editar trabajo (mismo formulario que añadir; guardar = borrar + añadir) */}
      {editingJob && quadrant && (
        <Modal
          open={!!editingJob}
          onClose={() => !addQuadrantJob.isPending && !deleteQuadrantJobMutation.isPending && setEditingJob(null)}
          title="Editar trabajo"
          maxWidth="max-w-md"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const worker = workersById[addJobForm.workerId];
              if (!addJobForm.houseId || !worker) return;
              const [sh, sm] = addJobForm.startTime.split(':').map(Number);
              const [eh, em] = addJobForm.endTime.split(':').map(Number);
              const startHour = new Date(dateObj);
              startHour.setHours(sh, sm, 0, 0);
              const endHour = new Date(dateObj);
              endHour.setHours(eh, em, 0, 0);
              const payload = {
                houseId: addJobForm.houseId,
                worker,
                startHour,
                endHour,
                date: dateObj,
              };
              deleteQuadrantJobMutation.mutate(
                {
                  quadrantId: quadrant.id,
                  jobId: editingJob.id,
                  job: {
                    houseId: editingJob.houseId,
                    worker: editingJob.worker,
                    workersId: editingJob.workersId,
                  },
                },
                {
                  onSuccess: () => {
                    addQuadrantJob.mutate(
                      { quadrantId: quadrant.id, payload },
                      {
                        onSuccess: () => {
                          setEditingJob(null);
                          setAddJobForm({ houseId: '', workerId: '', startTime: '09:00', endTime: '10:00' });
                        },
                      }
                    );
                  },
                }
              );
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Casa</label>
              <select
                required
                value={addJobForm.houseId}
                onChange={(e) => setAddJobForm((f) => ({ ...f, houseId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#126D9B] focus:ring-1 focus:ring-[#126D9B]"
              >
                <option value="">Selecciona una casa</option>
                {(houses || []).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.houseName || h.address || h.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
              <select
                required
                value={addJobForm.workerId}
                onChange={(e) => setAddJobForm((f) => ({ ...f, workerId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#126D9B] focus:ring-1 focus:ring-[#126D9B]"
              >
                <option value="">Selecciona un trabajador</option>
                {(workers || []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {[w.firstName, w.lastName].filter(Boolean).join(' ') || w.name || w.email || w.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <Input
                  type="time"
                  value={addJobForm.startTime}
                  onChange={(e) => setAddJobForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <Input
                  type="time"
                  value={addJobForm.endTime}
                  onChange={(e) => setAddJobForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingJob(null)}
                disabled={addQuadrantJob.isPending || deleteQuadrantJobMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addQuadrantJob.isPending || deleteQuadrantJobMutation.isPending}
              >
                {(addQuadrantJob.isPending || deleteQuadrantJobMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Crear cuadrante del día */}
      {proposeModalOpen && (
        <Modal
          open={proposeModalOpen}
          onClose={() => {
            if (!applyingProposal) {
              setProposeModalOpen(false);
              setProposalResult(null);
            }
          }}
          title="Crear cuadrante del día"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {!proposalResult ? (
              <>
                <p className="text-sm text-gray-600">
                  Elige las casas a cubrir y los trabajadores disponibles. El sistema asignará cada casa a un trabajador
                  y propondrá franjas horarias (por proximidad si hay coordenadas).
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Casas a incluir (minutos por casa)</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                    {(houses || []).map((h) => {
                      const selected = proposalForm.houseIds.includes(h.id);
                      const durationRaw = proposalForm.houseDurations[h.id];
                      const durationDisplay = durationRaw !== undefined && durationRaw !== '' ? String(durationRaw) : '120';
                      return (
                        <div key={h.id} className="flex items-center gap-2 flex-wrap">
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {
                                setProposalForm((f) => {
                                  const nextIds = f.houseIds.includes(h.id)
                                    ? f.houseIds.filter((id) => id !== h.id)
                                    : [...f.houseIds, h.id];
                                  const nextDurations = { ...f.houseDurations };
                                  if (!nextIds.includes(h.id)) delete nextDurations[h.id];
                                  else nextDurations[h.id] = 120;
                                  return { ...f, houseIds: nextIds, houseDurations: nextDurations };
                                });
                              }}
                              className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]"
                            />
                            <span className="text-sm">{h.houseName || h.address || h.id}</span>
                          </label>
                          {selected && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <span className="hidden sm:inline">min:</span>
                              <input
                                type="number"
                                min={1}
                                max={480}
                                value={durationDisplay}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setProposalForm((f) => ({
                                    ...f,
                                    houseDurations: { ...f.houseDurations, [h.id]: raw === '' ? '' : raw },
                                  }));
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value.trim();
                                  const v = raw === '' ? 120 : parseInt(raw, 10);
                                  const normalized = Number.isNaN(v) ? 120 : Math.max(1, Math.min(480, v));
                                  setProposalForm((f) => ({
                                    ...f,
                                    houseDurations: { ...f.houseDurations, [h.id]: normalized },
                                  }));
                                }}
                                className="w-16 rounded border border-gray-300 px-1.5 py-0.5 text-sm"
                              />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trabajadores disponibles</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                    {(workers || []).map((w) => (
                      <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalForm.workerIds.includes(w.id)}
                          onChange={() => {
                            setProposalForm((f) => {
                              const isAdding = !f.workerIds.includes(w.id);
                              const nextIds = isAdding
                                ? [...f.workerIds, w.id]
                                : f.workerIds.filter((id) => id !== w.id);
                              const nextHours = { ...f.workerWorkHours };
                              if (isAdding && !nextHours[w.id]) {
                                nextHours[w.id] = { workStart: '08:00', workEnd: '18:00' };
                              }
                              if (!isAdding) delete nextHours[w.id];
                              return { ...f, workerIds: nextIds, workerWorkHours: nextHours };
                            });
                          }}
                          className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]"
                        />
                        <span className="text-sm">
                          {[w.firstName, w.lastName].filter(Boolean).join(' ') || w.name || w.email || w.id}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {proposalForm.workerIds.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jornada por trabajador (inicio y fin)</label>
                    <div className="space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50/50">
                      {proposalForm.workerIds.map((workerId) => {
                        const w = workersById[workerId];
                        const name = w ? ([w.firstName, w.lastName].filter(Boolean).join(' ') || w.name || w.email || workerId) : workerId;
                        const hours = proposalForm.workerWorkHours[workerId] || { workStart: '08:00', workEnd: '18:00' };
                        return (
                          <div key={workerId} className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-40 shrink-0">{name}</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={hours.workStart}
                                onChange={(e) =>
                                  setProposalForm((f) => ({
                                    ...f,
                                    workerWorkHours: {
                                      ...f.workerWorkHours,
                                      [workerId]: { ...(f.workerWorkHours[workerId] || { workStart: '08:00', workEnd: '18:00' }), workStart: e.target.value },
                                    },
                                  }))
                                }
                                className="w-28"
                              />
                              <span className="text-gray-400">–</span>
                              <Input
                                type="time"
                                value={hours.workEnd}
                                onChange={(e) =>
                                  setProposalForm((f) => ({
                                    ...f,
                                    workerWorkHours: {
                                      ...f.workerWorkHours,
                                      [workerId]: { ...(f.workerWorkHours[workerId] || { workStart: '08:00', workEnd: '18:00' }), workEnd: e.target.value },
                                    },
                                  }))
                                }
                                className="w-28"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setProposeModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      const workerWorkHours = {};
                      proposalForm.workerIds.forEach((wid) => {
                        const h = proposalForm.workerWorkHours[wid];
                        if (h) workerWorkHours[wid] = { workStart: h.workStart || '08:00', workEnd: h.workEnd || '18:00' };
                        else workerWorkHours[wid] = { workStart: '08:00', workEnd: '18:00' };
                      });
                      proposeAssignment.mutate(
                        {
                          date: selectedDate,
                          houseIds: proposalForm.houseIds,
                          workerIds: proposalForm.workerIds,
                          workerWorkHours,
                          options: {
                            defaultDurationMinutes: 120,
                            workerWorkHours,
                            houseDurations: Object.fromEntries(
                              proposalForm.houseIds.map((id) => [
                                id,
                                Math.max(1, Math.min(480, Number(proposalForm.houseDurations[id]) || 120)),
                              ])
                            ),
                          },
                        },
                        {
                          onSuccess: (data) => setProposalResult(data),
                          onError: () => setProposalResult({ assignments: [], message: 'Error al generar la propuesta.' }),
                        }
                      );
                    }}
                    disabled={
                      proposeAssignment.isPending ||
                      proposalForm.houseIds.length === 0 ||
                      proposalForm.workerIds.length === 0
                    }
                  >
                    {proposeAssignment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generando…
                      </>
                    ) : (
                      'Generar propuesta'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {proposalResult.message && (
                  <p className="text-sm text-amber-600">{proposalResult.message}</p>
                )}
                {proposalResult.assignments?.length > 0 ? (
                  <>
                    <div className="overflow-x-auto max-h-60 border border-gray-200 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Trabajador</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Casa</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Inicio</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Fin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposalResult.assignments.map((a, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="px-3 py-2">
                                {[a.worker?.firstName, a.worker?.lastName].filter(Boolean).join(' ') || a.workerId}
                              </td>
                              <td className="px-3 py-2">{a.house?.houseName || a.houseId}</td>
                              <td className="px-3 py-2">{a.startTime}</td>
                              <td className="px-3 py-2">{a.endTime}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setProposalResult(null)}
                        disabled={applyingProposal}
                      >
                        Volver a configurar
                      </Button>
                      <Button
                        onClick={async () => {
                          setApplyingProposal(true);
                          try {
                            const { id: quadrantId } = await createQuadrant.mutateAsync(dateObj);
                            for (const a of proposalResult.assignments) {
                              await addQuadrantJob.mutateAsync({
                                quadrantId,
                                payload: {
                                  houseId: a.houseId,
                                  worker: a.worker,
                                  startHour: new Date(selectedDate + 'T' + a.startTime),
                                  endHour: new Date(selectedDate + 'T' + a.endTime),
                                  date: dateObj,
                                },
                              });
                            }
                            const dateStr = selectedDate;
                            queryClient.invalidateQueries({ queryKey: ['quadrants', companyId, dateStr] });
                            await new Promise((r) => setTimeout(r, 300));
                            await queryClient.refetchQueries({ queryKey: ['quadrants', companyId, dateStr] });
                            setProposeModalOpen(false);
                            setProposalResult(null);
                          } catch (err) {
                            console.error('Error aplicando propuesta', err);
                          } finally {
                            setApplyingProposal(false);
                          }
                        }}
                        disabled={applyingProposal}
                      >
                        {applyingProposal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Creando cuadrante…
                          </>
                        ) : (
                          'Crear cuadrante con esta propuesta'
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={() => setProposalResult(null)}>
                      Volver
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
