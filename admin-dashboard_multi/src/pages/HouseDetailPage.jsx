import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useHouses,
  useChecklists,
  useIncidences,
  useJobs,
} from '@/hooks/useFirestore';
import {
  Home,
  ArrowLeft,
  MapPin,
  User,
  CheckSquare,
  AlertCircle,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import { useState } from 'react';

const PLACEHOLDER_IMAGE = '/placeholder-house.png';

function getIncidenceHouseId(incidence) {
  if (incidence.houseId) return incidence.houseId;
  if (incidence.house?.id) return incidence.house.id;
  if (incidence.house?.[0]?.id) return incidence.house[0].id;
  return null;
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

function WorkerChip({ worker }) {
  const name = `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'Trabajador';
  if (!worker.id) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">{name}</span>;
  return (
    <Link
      to={`/trabajadores/${worker.id}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <User className="w-3 h-3" />
      {name}
    </Link>
  );
}

export default function HouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: houses = [] } = useHouses();
  const house = houses.find((h) => h.id === id);

  const { data: checklists = [], isLoading: loadingChecklists, isError: checklistsError } = useChecklists({ houseId: id });
  const { data: incidences = [], isLoading: loadingIncidences } = useIncidences();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();

  const houseIncidences = useMemo(
    () => incidences.filter((inc) => getIncidenceHouseId(inc) === id),
    [incidences, id]
  );
  const houseJobs = useMemo(() => jobs.filter((job) => job.houseId === id), [jobs, id]);

  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const handleEdit = () => {
    navigate('/casas', { state: { openHouseId: id } });
  };

  if (!house) {
    return (
      <div className="space-y-4">
        <Link to="/casas" className="inline-flex items-center gap-2 text-sm text-[#126D9B] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a Casas
        </Link>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Propiedad no encontrada.</p>
        </Card>
      </div>
    );
  }

  const loading = loadingChecklists || loadingIncidences || loadingJobs;
  const hasActivity = checklists.length > 0 || houseIncidences.length > 0 || houseJobs.length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb + Editar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/casas"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#126D9B] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Casas
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {house.houseName || 'Sin nombre'}
          </h1>
        </div>
        <Button variant="outline" onClick={handleEdit} className="shrink-0">
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal: datos + actividad */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">Datos de la propiedad</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-40 sm:h-36 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {house.houseImage?.original ? (
                  <img
                    src={house.houseImage.original}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={PLACEHOLDER_IMAGE} alt="" className="h-16 object-contain opacity-40" />
                  </div>
                )}
              </div>
              <div className="space-y-2 min-w-0">
                {(house.street || house.municipio) && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {[house.street, house.municipio].filter(Boolean).join(', ')}
                    {house.cp && ` ${house.cp}`}
                  </p>
                )}
                {house.phone && (
                  <p className="text-sm text-gray-600">{house.phone}</p>
                )}
                {house.owner && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    {house.owner.firstName} {house.owner.lastName}
                  </p>
                )}
                {house.notes && (
                  <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">{house.notes}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#126D9B]" />
              Actividad en esta propiedad
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Revisiones, incidencias y trabajos vinculados a esta casa.
            </p>
            {checklistsError ? (
              <p className="text-sm text-amber-600">Error al cargar revisiones. Revisa la consola del navegador.</p>
            ) : loading ? (
              <p className="text-sm text-gray-500">Cargando actividad...</p>
            ) : !hasActivity ? (
              <p className="text-sm text-gray-500">Sin actividad registrada aún.</p>
            ) : (
              <ul className="space-y-2">
                {checklists.map((cl) => {
                  const d = toDate(cl.date);
                  const done = cl.done ?? 0;
                  const total = cl.total ?? 0;
                  return (
                    <li key={cl.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedChecklist(cl)}
                        className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group"
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
                          </p>
                          {(cl.workers || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(cl.workers || []).map((w, i) => (
                                <WorkerChip key={w.id || i} worker={w} />
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </button>
                    </li>
                  );
                })}
                {houseIncidences.map((inc) => {
                  const d = toDate(inc.date || inc.createdAt);
                  return (
                    <li key={inc.id}>
                      <Link
                        to="/incidencias"
                        className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group"
                      >
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
                          </p>
                          {(inc.workers || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(inc.workers || []).map((w, i) => (
                                <WorkerChip key={w.id || i} worker={w} />
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </Link>
                    </li>
                  );
                })}
                {houseJobs.map((job) => {
                  const d = toDate(job.createdAt);
                  const statusLabel = job.status === 'completed' ? 'Completado' : job.status === 'in_progress' ? 'En curso' : 'Pendiente';
                  return (
                    <li key={job.id}>
                      <Link
                        to="/trabajos"
                        className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group"
                      >
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
                          </p>
                          {(job.workers || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(job.workers || []).map((w, i) => (
                                <WorkerChip key={w.id || i} worker={w} />
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Las comunicaciones con el propietario están en la ficha del{' '}
              <Link to="/propietarios" className="text-[#126D9B] hover:underline">propietario</Link>.
            </p>
          </Card>
        </div>

        {/* Columna lateral: resumen */}
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Propietario</p>
            {house.owner ? (
              <Link
                to={`/propietarios/${house.owner.id}`}
                className="font-medium text-[#126D9B] hover:underline"
              >
                {house.owner.firstName} {house.owner.lastName}
              </Link>
            ) : (
              <p className="text-sm text-gray-500">Sin asignar</p>
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
