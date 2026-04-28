import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useHouses,
  useChecklists,
  useIncidences,
  useJobs,
  useCreateJob,
  useCreateIncidence,
  useCreateChecklist,
  useChecksCatalog,
  useInspectionReports,
  useWorkersFirestore,
} from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';
import {
  ArrowLeft,
  MapPin,
  User,
  CheckSquare,
  AlertCircle,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Pencil,
  Plus,
  FileText,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import IncidenceDetailPanel from '@/components/IncidenceDetailPanel';
import { JobDetailPanel, statusLabels, statusColors } from '@/pages/JobsPage';

const PLACEHOLDER_IMAGE = '/placeholder-house.png';

const TABS = [
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'trabajos', label: 'Trabajos', icon: Briefcase },
  { id: 'incidencias', label: 'Incidencias', icon: AlertCircle },
  { id: 'revisiones', label: 'Revisiones', icon: CheckSquare },
  { id: 'reportes', label: 'Reportes', icon: FileText },
];

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
  if (!worker.id)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
        {name}
      </span>
    );
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

// ——— Modales de creación ———

function NewJobModal({ house, onClose, onCreated }) {
  const createJob = useCreateJob();
  const { user, userData } = useAuth();
  const { data: workers = [] } = useWorkersFirestore();
  const [title, setTitle] = useState('');
  const [observations, setObservations] = useState('');
  const [dateValue, setDateValue] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());

  const selectedWorkers = workers.filter((w) => selectedWorkerIds.has(w.id));
  const canSubmit = title.trim();

  const toggleWorker = (id) => {
    setSelectedWorkerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await createJob.mutateAsync({
      title: title.trim(),
      jobName: title.trim(),
      observations: observations.trim() || undefined,
      houseId: house.id,
      house,
      workers: selectedWorkers.length > 0 ? selectedWorkers : undefined,
      workersId: selectedWorkers.map((w) => w.id),
      date: dateValue,
      createdBy: user && userData ? { uid: user.uid, email: userData.email || '' } : undefined,
    });
    onCreated();
  };

  return (
    <Modal open onClose={onClose} title="Nuevo trabajo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Reparación persiana" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]" />
        </div>
        {workers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trabajadores</label>
            <ul className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {workers.map((w) => {
                const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email || 'Sin nombre';
                return (
                  <li key={w.id}>
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedWorkerIds.has(w.id)} onChange={() => toggleWorker(w.id)}
                        className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]" />
                      <span className="text-sm text-gray-900">{name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!canSubmit || createJob.isPending}>
            {createJob.isPending ? 'Creando…' : 'Crear trabajo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function NewIncidenceModal({ house, onClose, onCreated }) {
  const createIncidence = useCreateIncidence();
  const { user, userData } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const canSubmit = title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await createIncidence.mutateAsync({
      title: title.trim(),
      incidence: description.trim() || undefined,
      houseId: house.id,
      house,
      createdBy: user && userData ? { uid: user.uid, email: userData.email || '' } : undefined,
    });
    onCreated();
  };

  return (
    <Modal open onClose={onClose} title="Nueva incidencia">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Fuga de agua en baño" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!canSubmit || createIncidence.isPending}>
            {createIncidence.isPending ? 'Creando…' : 'Crear incidencia'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function NewChecklistModal({ house, onClose, onCreated }) {
  const createChecklist = useCreateChecklist();
  const { data: checkTemplates = [] } = useChecksCatalog();
  const { data: workers = [] } = useWorkersFirestore();
  const [dateValue, setDateValue] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [observations, setObservations] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState(new Set());
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());

  const selectedTemplates = checkTemplates.filter((t) => selectedTemplateIds.has(t.id));
  const selectedWorkers = workers.filter((w) => selectedWorkerIds.has(w.id));
  const canSubmit = dateValue && selectedTemplates.length > 0;

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
        house,
        date: new Date(dateValue),
        observations: observations.trim() || undefined,
        workers: selectedWorkers.length > 0 ? selectedWorkers : undefined,
        workersId: selectedWorkers.length > 0 ? selectedWorkers.map((w) => w.id) : undefined,
        selectedTemplates,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas para esta revisión..." rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Puntos de la revisión *</label>
            <button type="button" onClick={selectAllTemplates} className="text-xs text-[#126D9B] hover:underline">
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
                    <input type="checkbox" checked={selectedTemplateIds.has(t.id)} onChange={() => toggleTemplate(t.id)}
                      className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]" />
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
              <button type="button" onClick={selectAllWorkers} className="text-xs text-[#126D9B] hover:underline">
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
                      <input type="checkbox" checked={selectedWorkerIds.has(w.id)} onChange={() => toggleWorker(w.id)}
                        className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]" />
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
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!canSubmit || createChecklist.isPending}>
            {createChecklist.isPending ? 'Creando…' : 'Crear revisión'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ——— Tabs ———

function ActividadTab({ jobs, incidences, checklists, onSelectJob, onSelectIncidence, onSelectChecklist }) {
  const allItems = useMemo(() => {
    const items = [];
    for (const j of jobs) {
      const d = toDate(j.date || j.createdAt);
      items.push({ type: 'job', date: d, data: j });
    }
    for (const inc of incidences) {
      const d = toDate(inc.date || inc.createdAt);
      items.push({ type: 'incidence', date: d, data: inc });
    }
    for (const cl of checklists) {
      const d = toDate(cl.date || cl.createdAt);
      items.push({ type: 'checklist', date: d, data: cl });
    }
    return items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
  }, [jobs, incidences, checklists]);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Activity className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">Sin actividad registrada aún</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {allItems.map((item) => {
        if (item.type === 'job') {
          const job = item.data;
          const status = job.status || 'pending';
          return (
            <li key={`job-${job.id}`}>
              <button type="button" onClick={() => onSelectJob(job)}
                className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
                <span className="flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-[#126D9B]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">{job.title || job.jobName || 'Trabajo'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[status]}`}>{statusLabels[status]}</span>
                    {item.date && <span className="text-xs text-gray-400">{format(item.date, 'd MMM yyyy', { locale: es })}</span>}
                  </div>
                  {(job.workers || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(job.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
              </button>
            </li>
          );
        }
        if (item.type === 'incidence') {
          const inc = item.data;
          return (
            <li key={`inc-${inc.id}`}>
              <button type="button" onClick={() => onSelectIncidence(inc)}
                className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
                <span className="flex-shrink-0 mt-0.5">
                  <AlertCircle className={`w-4 h-4 ${inc.done ? 'text-emerald-500' : 'text-amber-500'}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">{inc.title || 'Incidencia'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {inc.done
                      ? <span className="text-xs text-emerald-600">Cerrada</span>
                      : <span className="text-xs text-amber-600">Abierta</span>}
                    {item.date && <span className="text-xs text-gray-400">{format(item.date, 'd MMM yyyy', { locale: es })}</span>}
                  </div>
                  {(inc.workers || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(inc.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
              </button>
            </li>
          );
        }
        if (item.type === 'checklist') {
          const cl = item.data;
          const done = cl.done ?? 0;
          const total = cl.total ?? 0;
          return (
            <li key={`cl-${cl.id}`}>
              <button type="button" onClick={() => onSelectChecklist(cl)}
                className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
                <span className="flex-shrink-0 mt-0.5">
                  {cl.finished
                    ? <CheckCircle className="w-4 h-4 text-[#67B26F]" />
                    : <CheckSquare className="w-4 h-4 text-[#126D9B]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">Revisión · {done}/{total} puntos</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {cl.finished && <span className="text-xs text-emerald-600">Finalizada</span>}
                    {item.date && <span className="text-xs text-gray-400">{format(item.date, 'd MMM yyyy', { locale: es })}</span>}
                  </div>
                  {(cl.workers || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(cl.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
              </button>
            </li>
          );
        }
        return null;
      })}
    </ul>
  );
}

function TrabajosTab({ jobs, onSelectJob, onNewJob }) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">Sin trabajos en esta propiedad</p>
        <Button onClick={onNewJob} size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Nuevo trabajo</Button>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {jobs.map((job) => {
        const status = job.status || 'pending';
        const d = toDate(job.date || job.createdAt);
        return (
          <li key={job.id}>
            <button type="button" onClick={() => onSelectJob(job)}
              className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
              <span className="flex-shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4 text-[#126D9B]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">{job.title || job.jobName || 'Trabajo'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[status]}`}>{statusLabels[status]}</span>
                  {d && (
                    <span className="text-xs text-gray-400">
                      {format(d, 'd MMM yyyy', { locale: es })}
                    </span>
                  )}
                </div>
                {(job.workers || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(job.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function IncidenciasTab({ incidences, onSelectIncidence, onNewIncidence }) {
  if (incidences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">Sin incidencias en esta propiedad</p>
        <Button onClick={onNewIncidence} size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Nueva incidencia</Button>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {incidences.map((inc) => {
        const d = toDate(inc.date || inc.createdAt);
        return (
          <li key={inc.id}>
            <button type="button" onClick={() => onSelectIncidence(inc)}
              className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
              <span className="flex-shrink-0 mt-0.5">
                <AlertCircle className={`w-4 h-4 ${inc.done ? 'text-emerald-500' : 'text-amber-500'}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">{inc.title || 'Incidencia'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {inc.done
                    ? <span className="text-xs text-emerald-600">Cerrada</span>
                    : <span className="text-xs text-amber-600">Abierta</span>}
                  {d && <span className="text-xs text-gray-400">{format(d, 'd MMM yyyy', { locale: es })}</span>}
                </div>
                {(inc.workers || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(inc.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function RevisionesTab({ checklists, onSelectChecklist, onNewChecklist }) {
  if (checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <CheckSquare className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">Sin revisiones en esta propiedad</p>
        <Button onClick={onNewChecklist} size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Nueva revisión</Button>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {checklists.map((cl) => {
        const d = toDate(cl.date);
        const done = cl.done ?? 0;
        const total = cl.total ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <li key={cl.id}>
            <button type="button" onClick={() => onSelectChecklist(cl)}
              className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
              <span className="flex-shrink-0 mt-0.5">
                {cl.finished
                  ? <CheckCircle className="w-4 h-4 text-[#67B26F]" />
                  : <CheckSquare className="w-4 h-4 text-[#126D9B]" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">
                    {d ? format(d, "d 'de' MMMM yyyy", { locale: es }) : 'Revisión'}
                  </p>
                  {cl.finished
                    ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Finalizada</span>
                    : total > 0
                      ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">En progreso</span>
                      : null}
                </div>
                {total > 0 && (
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-gray-400">{done}/{total} puntos</span>
                      <span className={`font-medium ${cl.finished ? 'text-emerald-600' : 'text-[#126D9B]'}`}>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${cl.finished ? 'bg-[#67B26F]' : 'bg-[#126D9B]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
                {cl.observations && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cl.observations}</p>
                )}
                {(cl.workers || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(cl.workers || []).map((w, i) => <WorkerChip key={w.id || i} worker={w} />)}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ReportesTab({ houseId }) {
  const { data: allReports = [], isLoading } = useInspectionReports();
  const reports = useMemo(
    () => allReports.filter((r) => r.propertyId === houseId || r.houseId === houseId),
    [allReports, houseId]
  );

  if (isLoading) return <p className="text-sm text-gray-500 py-8 text-center">Cargando...</p>;

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <FileText className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">Sin reportes de inspección para esta propiedad</p>
        <p className="text-xs text-gray-400 mt-1">Los reportes se generan desde el bot de Telegram</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {reports.map((report) => {
        const d = toDate(report.createdAt);
        const requiresImmediate = report.pipelineResult?.summary?.requiresImmediateAction;
        const summary = report.pipelineResult?.summary?.transcriptionSummary;
        return (
          <li key={report.id}>
            <Link to="/reportes"
              className="w-full flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors text-left group">
              <span className="flex-shrink-0 mt-0.5">
                <FileText className={`w-4 h-4 ${requiresImmediate ? 'text-red-500' : 'text-[#126D9B]'}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#126D9B]">
                    {d ? format(d, "d 'de' MMMM yyyy", { locale: es }) : 'Reporte'}
                  </p>
                  {requiresImmediate && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-700">Atención inmediata</span>
                  )}
                </div>
                {summary && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{summary}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ——— Página principal ———

export default function HouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: houses = [] } = useHouses();
  const house = houses.find((h) => h.id === id);

  const [activeTab, setActiveTab] = useState('actividad');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showNewIncidence, setShowNewIncidence] = useState(false);
  const [showNewChecklist, setShowNewChecklist] = useState(false);

  const { data: checklists = [] } = useChecklists({ houseId: id });
  const { data: allIncidences = [] } = useIncidences();
  const { data: allJobs = [] } = useJobs();
  const { data: allReports = [] } = useInspectionReports();
  const houseReports = useMemo(
    () => allReports.filter((r) => r.propertyId === id || r.houseId === id),
    [allReports, id]
  );

  const incidences = useMemo(() => allIncidences.filter((inc) => getIncidenceHouseId(inc) === id), [allIncidences, id]);
  const jobs = useMemo(() => allJobs.filter((job) => job.houseId === id), [allJobs, id]);

  const openIncidences = useMemo(() => incidences.filter((i) => !i.done).length, [incidences]);
  const pendingJobs = useMemo(() => jobs.filter((j) => j.status === 'pending' || j.status === 'in_progress').length, [jobs]);
  const lastChecklist = useMemo(() => {
    const sorted = checklists
      .map((cl) => toDate(cl.date))
      .filter(Boolean)
      .sort((a, b) => b - a);
    return sorted[0] ?? null;
  }, [checklists]);

  const [nowTs] = useState(() => Date.now());
  const daysSinceLastChecklist = lastChecklist
    ? Math.floor((nowTs - lastChecklist.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleEdit = () => {
    navigate('/casas', { state: { openHouseId: id } });
  };

  const tabBadges = useMemo(() => ({
    trabajos: jobs.length || null,
    incidencias: incidences.length || null,
    revisiones: checklists.length || null,
    reportes: houseReports.length || null,
  }), [jobs.length, incidences.length, checklists.length, houseReports.length]);

  const newActionByTab = {
    trabajos: { label: 'Nuevo trabajo', action: () => setShowNewJob(true) },
    incidencias: { label: 'Nueva incidencia', action: () => setShowNewIncidence(true) },
    revisiones: { label: 'Nueva revisión', action: () => setShowNewChecklist(true) },
  };
  const currentAction = newActionByTab[activeTab];

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

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/casas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#126D9B] transition-colors shrink-0">
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

      {/* Datos de la propiedad */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full sm:w-40 h-32 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {house.houseImage?.original ? (
              <img src={house.houseImage.original} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img src={PLACEHOLDER_IMAGE} alt="" className="h-14 object-contain opacity-40" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {(house.street || house.municipio) && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                {[house.street, house.municipio].filter(Boolean).join(', ')}
                {house.cp && ` ${house.cp}`}
              </p>
            )}
            {house.phone && (
              <p className="text-sm text-gray-600">{house.phone}</p>
            )}
            {house.owner && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <Link to={`/propietarios/${house.owner.id}`} className="text-[#126D9B] hover:underline">
                  {house.owner.firstName} {house.owner.lastName}
                </Link>
              </p>
            )}
            {house.notes && (
              <p className="text-sm text-gray-500 pt-1 border-t border-gray-100">{house.notes}</p>
            )}
          </div>
        </div>

        {/* KPI bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
          <div className={`rounded-lg px-3 py-2 text-center ${openIncidences > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
            <p className={`text-lg font-bold ${openIncidences > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
              {openIncidences}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {openIncidences === 1 ? 'incidencia abierta' : 'incidencias abiertas'}
            </p>
          </div>
          <div className={`rounded-lg px-3 py-2 text-center ${pendingJobs > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <p className={`text-lg font-bold ${pendingJobs > 0 ? 'text-[#126D9B]' : 'text-gray-400'}`}>
              {pendingJobs}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {pendingJobs === 1 ? 'trabajo pendiente' : 'trabajos pendientes'}
            </p>
          </div>
          <div className="rounded-lg px-3 py-2 text-center bg-gray-50">
            {daysSinceLastChecklist === null ? (
              <>
                <p className="text-lg font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-500 mt-0.5">sin revisiones</p>
              </>
            ) : daysSinceLastChecklist === 0 ? (
              <>
                <p className="text-lg font-bold text-emerald-600">hoy</p>
                <p className="text-xs text-gray-500 mt-0.5">última revisión</p>
              </>
            ) : (
              <>
                <p className={`text-lg font-bold ${daysSinceLastChecklist > 14 ? 'text-amber-600' : 'text-gray-700'}`}>
                  {daysSinceLastChecklist}d
                </p>
                <p className="text-xs text-gray-500 mt-0.5">desde última revisión</p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs + botón crear */}
      <div className="flex items-end gap-3 border-b border-gray-200">
        <div className="flex gap-1 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#126D9B] text-[#126D9B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tabBadges[tab.id] != null && (
                <span className={`text-xs rounded-full px-1.5 ${activeTab === tab.id ? 'bg-[#126D9B]/10 text-[#126D9B]' : 'bg-gray-100 text-gray-500'}`}>
                  {tabBadges[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        {currentAction && (
          <Button size="sm" onClick={currentAction.action} className="shrink-0 mb-1">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {currentAction.label}
          </Button>
        )}
      </div>

      {/* Contenido del tab */}
      <div>
        {activeTab === 'actividad' && (
          <ActividadTab
            jobs={jobs}
            incidences={incidences}
            checklists={checklists}
            onSelectJob={setSelectedJob}
            onSelectIncidence={setSelectedIncidence}
            onSelectChecklist={setSelectedChecklist}
          />
        )}
        {activeTab === 'trabajos' && (
          <TrabajosTab
            jobs={jobs}
            onSelectJob={setSelectedJob}
            onNewJob={() => setShowNewJob(true)}
          />
        )}
        {activeTab === 'incidencias' && (
          <IncidenciasTab
            incidences={incidences}
            onSelectIncidence={setSelectedIncidence}
            onNewIncidence={() => setShowNewIncidence(true)}
          />
        )}
        {activeTab === 'revisiones' && (
          <RevisionesTab
            checklists={checklists}
            onSelectChecklist={setSelectedChecklist}
            onNewChecklist={() => setShowNewChecklist(true)}
          />
        )}
        {activeTab === 'reportes' && <ReportesTab houseId={id} />}
      </div>

      {/* Modales de creación */}
      {showNewJob && (
        <NewJobModal house={house} onClose={() => setShowNewJob(false)} onCreated={() => setShowNewJob(false)} />
      )}
      {showNewIncidence && (
        <NewIncidenceModal house={house} onClose={() => setShowNewIncidence(false)} onCreated={() => setShowNewIncidence(false)} />
      )}
      {showNewChecklist && (
        <NewChecklistModal house={house} onClose={() => setShowNewChecklist(false)} onCreated={() => setShowNewChecklist(false)} />
      )}

      {/* Paneles de detalle */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          houses={houses}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={(updated) => setSelectedJob(updated)}
          onDeleted={() => setSelectedJob(null)}
        />
      )}
      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allHouses={houses}
        />
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
