import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useWorkersFirestore,
  useChecklists,
  useIncidences,
  useJobs,
} from '@/hooks/useFirestore';
import {
  ArrowLeft,
  CheckSquare,
  AlertCircle,
  Briefcase,
  CheckCircle,
  ChevronRight,
  User,
  Home,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';

function getIncidenceHouseId(incidence) {
  if (incidence.houseId) return incidence.houseId;
  if (incidence.house?.id) return incidence.house.id;
  if (incidence.house?.[0]?.id) return incidence.house[0].id;
  return null;
}

function getChecklistHouseId(cl) {
  return cl.houseId || cl.house?.[0]?.id || cl.house?.id;
}

function toDate(value) {
  if (!value) return null;
  try {
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    if (value._d) return value._d;
    return new Date(value);
  } catch {
    return null;
  }
}

function getWorkerPhoto(worker) {
  const raw =
    (typeof worker.profileImage === 'object' && (worker.profileImage?.small || worker.profileImage?.original)) ||
    worker.profileImage ||
    worker.photoURL ||
    worker.photo;
  return getSafeImageUrl(raw);
}

export default function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: workers = [] } = useWorkersFirestore();
  const worker = workers.find((w) => w.id === id);

  const { data: checklists = [], isLoading: loadingCl } = useChecklists({ limitCount: 200 });
  const { data: incidences = [], isLoading: loadingInc } = useIncidences();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();

  const workerChecklists = useMemo(
    () => checklists.filter((cl) => (cl.workersId || []).includes(id) || (cl.workers || []).some((w) => w.id === id)),
    [checklists, id]
  );
  const workerIncidences = useMemo(
    () => incidences.filter((inc) => (inc.workersId || []).includes(id) || (inc.workers || []).some((w) => w.id === id)),
    [incidences, id]
  );
  const workerJobs = useMemo(
    () => jobs.filter((job) => (job.workersId || []).includes(id) || (job.workers || []).some((w) => w.id === id)),
    [jobs, id]
  );

  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const loading = loadingCl || loadingInc || loadingJobs;
  const hasActivity = workerChecklists.length > 0 || workerIncidences.length > 0 || workerJobs.length > 0;

  if (!worker) {
    return (
      <div className="space-y-4">
        <Link to="/trabajadores" className="inline-flex items-center gap-2 text-sm text-[#126D9B] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a Trabajadores
        </Link>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Trabajador no encontrado.</p>
        </Card>
      </div>
    );
  }

  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'Sin nombre';
  const photo = getWorkerPhoto(worker);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/trabajadores"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#126D9B] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Trabajadores
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 truncate">{fullName}</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/trabajadores', { state: { openWorkerId: id } })}
          className="shrink-0"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">Datos del trabajador</h2>
            <div className="flex items-center gap-4">
              {photo ? (
                <img src={photo} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">{fullName.charAt(0) || '?'}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{fullName}</p>
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Trabajador
                </span>
                {worker.email && (
                  <p className="text-sm text-gray-500 mt-1">{worker.email}</p>
                )}
                {worker.phone && (
                  <p className="text-sm text-gray-500">{worker.phone}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-[#126D9B]" />
              Actividad de este trabajador
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Revisiones, incidencias y trabajos asignados a este trabajador.
            </p>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando actividad...</p>
            ) : !hasActivity ? (
              <p className="text-sm text-gray-500">Sin actividad registrada aún.</p>
            ) : (
              <ul className="space-y-2">
                {workerChecklists.map((cl) => {
                  const d = toDate(cl.date);
                  const done = cl.done ?? 0;
                  const total = cl.total ?? 0;
                  const houseId = getChecklistHouseId(cl);
                  const houseName = cl.house?.[0]?.houseName || cl.houseName || 'Sin casa';
                  return (
                    <li key={cl.id}>
                      <div className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group">
                        <button
                          type="button"
                          onClick={() => setSelectedChecklist(cl)}
                          className="flex-1 flex gap-3 text-left min-w-0"
                        >
                          <span className="flex-shrink-0 mt-0.5">
                            {cl.finished ? (
                              <CheckCircle className="w-4 h-4 text-[#67B26F]" />
                            ) : (
                              <CheckSquare className="w-4 h-4 text-[#126D9B]" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">
                              Revisión · {done}/{total} puntos
                            </p>
                            <p className="text-xs text-gray-500">
                              {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                              {cl.finished && <span className="text-[#67B26F]"> · Finalizada</span>}
                              {houseId && (
                                <>
                                  {' · '}
                                  <Link
                                    to={`/casas/${houseId}`}
                                    className="text-[#126D9B] hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Home className="w-3 h-3 inline mr-0.5" />
                                    {houseName}
                                  </Link>
                                </>
                              )}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                        </button>
                        {houseId && (
                          <Link
                            to={`/casas/${houseId}`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#126D9B] hover:bg-[#126D9B]/10 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Home className="w-3 h-3" />
                            Casa
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
                {workerIncidences.map((inc) => {
                  const d = toDate(inc.date || inc.createdAt);
                  const houseId = getIncidenceHouseId(inc);
                  const houseName = inc.house?.houseName || inc.house?.[0]?.houseName || 'Sin casa';
                  return (
                    <li key={inc.id}>
                      <div className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group">
                        <Link to="/incidencias" className="flex-1 flex gap-3 min-w-0">
                          <span className="flex-shrink-0 mt-0.5">
                            <AlertCircle className={`w-4 h-4 ${inc.done ? 'text-emerald-500' : 'text-amber-500'}`} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">
                              {inc.title || 'Incidencia'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                              {inc.done ? <span className="text-emerald-600"> · Cerrada</span> : <span className="text-amber-600"> · Abierta</span>}
                              {houseId && <> · <span className="text-[#126D9B]">{houseName}</span></>}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                        </Link>
                        {houseId && (
                          <Link
                            to={`/casas/${houseId}`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#126D9B] hover:bg-[#126D9B]/10 shrink-0"
                          >
                            <Home className="w-3 h-3" />
                            Casa
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
                {workerJobs.map((job) => {
                  const d = toDate(job.createdAt);
                  const statusLabel = job.status === 'done' || job.status === 'completed' ? 'Completado' : job.status === 'in_progress' ? 'En curso' : 'Pendiente';
                  const houseId = job.houseId || job.house?.[0]?.id || job.house?.id;
                  const houseName = job.house?.[0]?.houseName || job.house?.houseName || 'Sin casa';
                  return (
                    <li key={job.id}>
                      <div className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group">
                        <Link to="/trabajos" className="flex-1 flex gap-3 min-w-0">
                          <span className="flex-shrink-0 mt-0.5">
                            <Briefcase className="w-4 h-4 text-[#126D9B]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">
                              {job.title || job.jobName || 'Trabajo'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {d ? format(d, "d MMM yyyy", { locale: es }) : '—'}
                              <span className="text-gray-500"> · {statusLabel}</span>
                              {houseId && <> · <span className="text-[#126D9B]">{houseName}</span></>}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                        </Link>
                        {houseId && (
                          <Link
                            to={`/casas/${houseId}`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#126D9B] hover:bg-[#126D9B]/10 shrink-0"
                          >
                            <Home className="w-3 h-3" />
                            Casa
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
    </div>
  );
}
