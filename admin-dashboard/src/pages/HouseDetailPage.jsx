import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import HouseLocationMap from '@/components/HouseLocationMap';
import { ReportDetailPanel } from '@/pages/ReportesPage';
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
  Phone,
  Mail,
  Home as HomeIcon,
  ImageIcon,
  ClipboardList,
  FolderClosed,
  Download,
  ExternalLink,
  Sparkles,
  Wifi,
  Key,
  Bed,
  Bath,
  Ruler,
  Users as UsersIcon,
  PawPrint,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';
import IncidenceDetailPanel from '@/components/IncidenceDetailPanel';
import { JobDetailPanel, statusLabels, statusColors } from '@/pages/JobsPage';
import { Pill } from '@/components/ui/Pill';
import { QualityBar } from '@/components/ui/QualityBar';
import { Sparkline } from '@/components/ui/Sparkline';
import { EmptyState } from '@/components/ui/EmptyState';

const PLACEHOLDER_IMAGE = '/placeholder-house.png';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: ClipboardList },
  { id: 'incidencias', label: 'Incidencias', icon: AlertCircle },
  { id: 'revisiones', label: 'Revisiones', icon: CheckSquare },
  { id: 'trabajos', label: 'Trabajos', icon: Briefcase },
  { id: 'reportes', label: 'Reportes', icon: FileText },
  { id: 'documentos', label: 'Documentos', icon: FolderClosed },
];

const PRIORITY_VARIANT = {
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

const JOB_TYPE_DOT = {
  cleaning: 'bg-emerald-500',
  maintenance: 'bg-amber-500',
  inspection: 'bg-turquoise-500',
  default: 'bg-stone-400',
};

function formatRelativeShort(date) {
  if (!date) return '—';
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((d - day) / (1000 * 60 * 60 * 24));
  if (diff === 0) return `hoy ${format(date, 'HH:mm')}`;
  if (diff === 1) return 'ayer';
  if (diff < 30) return format(date, "d MMM", { locale: es });
  return format(date, "d MMM yyyy", { locale: es });
}

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

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-stone-500 text-sm">{label}</dt>
      <dd className={`text-stone-700 dark:text-stone-200 text-sm truncate ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function ActivityTimeline({ jobs, incidences, checklists, reports }) {
  const events = useMemo(() => {
    const list = [];
    incidences.forEach((i) => {
      const d = toDate(i.date || i.createdAt);
      if (!d) return;
      const w = i.workers?.[0];
      const wName = w ? `${(w.firstName ?? '').slice(0, 1)}. ${w.lastName ?? ''}`.trim() : 'Alguien';
      list.push({
        d,
        color: 'bg-amber-500',
        text: (
          <>
            <span className="font-medium text-stone-900 dark:text-stone-100">{wName}</span>{' '}
            creó incidencia: <span className="text-stone-700 dark:text-stone-200">{i.title || 'sin título'}</span>
          </>
        ),
      });
    });
    checklists.forEach((cl) => {
      const d = toDate(cl.date);
      if (!d || !cl.finished) return;
      const w = cl.workers?.[0];
      const wName = w ? `${(w.firstName ?? '').slice(0, 1)}. ${w.lastName ?? ''}`.trim() : 'Trabajador';
      const score =
        (cl.total ?? 0) > 0 ? Math.round(((cl.done ?? 0) / cl.total) * 100) : null;
      list.push({
        d,
        color: 'bg-emerald-500',
        text: (
          <>
            <span className="font-medium text-stone-900 dark:text-stone-100">{wName}</span>{' '}
            completó revisión {score != null && `· ${score}/100`}
          </>
        ),
      });
    });
    jobs.forEach((j) => {
      const d = toDate(j.createdAt);
      if (!d) return;
      list.push({
        d,
        color: 'bg-turquoise-500',
        text: (
          <>
            Trabajo &quot;{j.title || j.jobName || 'sin título'}&quot;{' '}
            {j.status === 'completed' || j.status === 'done' ? 'completado' : 'creado'}
          </>
        ),
      });
    });
    reports.forEach((r) => {
      const d = toDate(r.createdAt);
      if (!d) return;
      list.push({
        d,
        color: 'bg-stone-400',
        text: (
          <>
            Reporte de {format(d, 'MMMM', { locale: es })} enviado al propietario
          </>
        ),
      });
    });
    return list.sort((a, b) => b.d - a.d).slice(0, 6);
  }, [jobs, incidences, checklists, reports]);

  if (events.length === 0) {
    return <p className="px-5 py-6 text-center text-sm text-stone-400">Sin actividad reciente</p>;
  }

  return (
    <ol className="px-5 py-4 space-y-3">
      {events.map((ev, i) => (
        <li key={i} className="flex gap-2.5">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${ev.color}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-snug">{ev.text}</p>
            <p className="text-[11px] text-stone-400 font-mono tabular-nums mt-0.5">
              {formatRelativeShort(ev.d)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ——— Tab Resumen (vista control-tower) ———

function HeroPhoto({ house }) {
  const main = house.houseImage?.original;
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-64 bg-stone-100 dark:bg-stone-800">
        {main ? (
          <img src={main} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600" strokeWidth={1.25} />
          </div>
        )}
        {(house.street || house.municipio) && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {[house.street, house.municipio].filter(Boolean).join(', ')}
            {house.cp && ` · ${house.cp}`}
          </div>
        )}
      </div>
    </Card>
  );
}

function KpiStrip({
  qualityAvg,
  incidences30d, openInc, closedInc,
  trabajosTotal, trabajosActivos, trabajosCompletados,
  revisionesTotal, revisionesPendientes, ultimaRevision,
  avgJobMinutes,
}) {
  const formatDuration = (mins) => {
    if (mins == null || isNaN(mins)) return '—';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };
  const ultimaRevisionLabel =
    ultimaRevision == null
      ? 'sin revisiones'
      : ultimaRevision === 0
      ? 'hoy'
      : `hace ${ultimaRevision}d`;

  const items = [
    {
      label: 'Calidad media',
      value: qualityAvg != null ? Math.round(qualityAvg) : '—',
      suffix: qualityAvg != null ? '/100' : null,
      delta: qualityAvg != null ? `${revisionesTotal} revisión${revisionesTotal === 1 ? '' : 'es'}` : 'sin datos',
      deltaColor: 'text-stone-400',
    },
    {
      label: 'Incidencias 30d',
      value: incidences30d,
      suffix: null,
      delta: `${openInc} abierta${openInc === 1 ? '' : 's'} · ${closedInc} cerrada${closedInc === 1 ? '' : 's'}`,
      deltaColor: openInc > 0 ? 'text-amber-600' : 'text-stone-400',
    },
    {
      label: 'Trabajos',
      value: trabajosTotal,
      suffix: null,
      delta: `${trabajosActivos} activo${trabajosActivos === 1 ? '' : 's'} · ${trabajosCompletados} OK`,
      deltaColor: trabajosActivos > 0 ? 'text-turquoise-700' : 'text-stone-400',
    },
    {
      label: 'Revisiones',
      value: revisionesTotal,
      suffix: null,
      delta: revisionesPendientes > 0
        ? `${revisionesPendientes} en curso`
        : ultimaRevisionLabel,
      deltaColor: 'text-stone-400',
    },
    {
      label: 'Tiempo medio',
      value: formatDuration(avgJobMinutes),
      suffix: null,
      delta: avgJobMinutes != null ? 'por trabajo' : 'sin datos',
      deltaColor: 'text-stone-400',
    },
  ];
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[var(--border-soft)]">
        {items.map((it) => (
          <div key={it.label} className="px-4 py-3.5">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{it.label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums leading-none">
                {it.value}
              </span>
              {it.suffix && (
                <span className="text-xs text-stone-400">{it.suffix}</span>
              )}
            </div>
            <p className={`text-[11px] mt-1.5 ${it.deltaColor}`}>{it.delta}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function IncidenciasResumenCard({ incidences, onSelect, onTabChange }) {
  const open = incidences.filter((i) => !i.done).length;
  const inProgress = incidences.filter((i) => !i.done && i.state === 'in_progress').length;
  const closed = incidences.filter((i) => i.done).length;
  const top = useMemo(() => {
    return [...incidences]
      .sort((a, b) => {
        const da = toDate(a.date || a.createdAt)?.getTime() ?? 0;
        const db = toDate(b.date || b.createdAt)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 4);
  }, [incidences]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">Incidencias</h3>
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-px rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                {incidences.length}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {open} abierta{open === 1 ? '' : 's'} · {inProgress} en curso · {closed} resuelta{closed === 1 ? '' : 's'} en total
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onTabChange('incidencias')}
          className="text-xs font-medium text-turquoise-700 dark:text-turquoise-300 hover:underline inline-flex items-center gap-0.5"
        >
          Ver todas <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {top.length === 0 ? (
        <div className="py-10 text-center text-stone-400 text-sm">Sin incidencias registradas</div>
      ) : (
        <table className="dt-table">
          <thead>
            <tr>
              <th>Incidencia</th>
              <th style={{ width: 110 }}>Prioridad</th>
              <th style={{ width: 100 }}>Estado</th>
              <th style={{ width: 140 }}>Asignado</th>
              <th style={{ width: 90, textAlign: 'right' }}>Cuándo</th>
            </tr>
          </thead>
          <tbody>
            {top.map((inc) => {
              const w = inc.workers?.[0];
              const wName = w ? `${w.firstName ?? ''} ${w.lastName ?? ''}`.trim() : null;
              return (
                <tr
                  key={inc.id}
                  className="is-clickable"
                  onClick={() => onSelect(inc)}
                >
                  <td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          inc.priority === 'critical' ? 'bg-red-500' :
                          inc.priority === 'high' ? 'bg-orange-500' :
                          inc.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {inc.title || 'Sin título'}
                        </p>
                        {inc.category && (
                          <p className="text-[11px] text-stone-400 truncate">{inc.category}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {inc.priority ? (
                      <Pill variant={PRIORITY_VARIANT[inc.priority] ?? 'neutral'} dot>
                        {PRIORITY_LABEL[inc.priority] ?? inc.priority}
                      </Pill>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    {inc.done ? (
                      <Pill variant="resolved">Resuelta</Pill>
                    ) : inc.state === 'in_progress' ? (
                      <Pill variant="info">En curso</Pill>
                    ) : (
                      <Pill variant="critical">Abierta</Pill>
                    )}
                  </td>
                  <td>
                    {wName ? (
                      <span className="inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-200 text-sm">
                        <span className="w-5 h-5 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center">
                          {(w.firstName || '?').charAt(0).toUpperCase()}
                          {(w.lastName || '').charAt(0).toUpperCase()}
                        </span>
                        {wName}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono tabular-nums text-xs text-stone-500">
                      {formatRelativeShort(toDate(inc.date || inc.createdAt))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function RevisionesResumenCard({ checklists, onSelect, onNewChecklist }) {
  const recent = useMemo(() => {
    return [...checklists]
      .sort((a, b) => (toDate(b.date)?.getTime() ?? 0) - (toDate(a.date)?.getTime() ?? 0))
      .slice(0, 6);
  }, [checklists]);
  const lastDate = recent[0] ? toDate(recent[0].date) : null;
  const daysSinceLast =
    lastDate
      ? Math.max(0, Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)))
      : null;
  const avgGapDays = useMemo(() => {
    if (checklists.length < 2) return null;
    const dates = checklists
      .map((c) => toDate(c.date)?.getTime())
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (dates.length < 2) return null;
    const gaps = [];
    for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  }, [checklists]);
  const totalNotes = useMemo(
    () =>
      checklists.reduce((s, c) => {
        const n = Array.isArray(c.notes)
          ? c.notes.length
          : Array.isArray(c.itemsWithNotes)
          ? c.itemsWithNotes.length
          : c.notesCount ?? (c.observations ? 1 : 0);
        return s + n;
      }, 0),
    [checklists]
  );

  return (
    <Card className="overflow-hidden p-0 h-full">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">Revisiones</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {checklists.length} en total · {totalNotes} {totalNotes === 1 ? 'nota' : 'notas'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewChecklist}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium text-stone-700 dark:text-stone-200 border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Programar
        </button>
      </div>

      {/* Mini KPIs operativos */}
      <div className="grid grid-cols-2 divide-x divide-[var(--border-soft)] border-b border-[var(--border-soft)]">
        <div className="px-5 py-3">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Última</p>
          <p className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
            {daysSinceLast == null
              ? '—'
              : daysSinceLast === 0
              ? 'hoy'
              : `hace ${daysSinceLast}d`}
          </p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Cadencia media</p>
          <p className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">
            {avgGapDays == null ? '—' : `${avgGapDays}d`}
          </p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-stone-400 py-10 text-center">Sin revisiones registradas</p>
      ) : (
        <ul className="divide-y divide-[var(--border-soft)]">
          {recent.map((cl) => {
            const w = cl.workers?.[0];
            const wName = w
              ? `${(w.firstName ?? '').slice(0, 1)}. ${w.lastName ?? ''}`.trim()
              : 'Sin asignar';
            const notesCount = Array.isArray(cl.notes)
              ? cl.notes.length
              : Array.isArray(cl.itemsWithNotes)
              ? cl.itemsWithNotes.length
              : cl.notesCount ?? (cl.observations ? 1 : 0);
            const d = toDate(cl.date);
            return (
              <li key={cl.id}>
                <button
                  type="button"
                  onClick={() => onSelect(cl)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--row-hover)] transition-colors text-left"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      cl.finished ? 'bg-emerald-500' : 'bg-turquoise-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {wName}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {notesCount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {notesCount} {notesCount === 1 ? 'nota' : 'notas'}
                        </span>
                      ) : (
                        'Sin notas'
                      )}
                      {' · '}
                      {formatRelativeShort(d)}
                      {!cl.finished && ' · en curso'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function TrabajosResumenCard({ jobs, onSelect, onNewJob }) {
  const recent = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))
      .slice(0, 6);
  }, [jobs]);
  const active = jobs.filter((j) => j.status === 'in_progress' || j.status === 'pending').length;

  return (
    <Card className="overflow-hidden p-0 h-full">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">Trabajos</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Últimos {jobs.length} · {active} activo{active === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewJob}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium text-stone-700 dark:text-stone-200 border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Asignar
        </button>
      </div>
      {recent.length === 0 ? (
        <div className="py-10 text-center text-stone-400 text-sm">Sin trabajos registrados</div>
      ) : (
        <ul className="px-5 py-3 space-y-3">
          {recent.map((job) => {
            const w = job.workers?.[0];
            const wName = w ? `${(w.firstName ?? '').slice(0, 1)}. ${w.lastName ?? ''}`.trim() : 'Sin asignar';
            const isActive = job.status === 'in_progress';
            return (
              <li key={job.id} className="flex gap-3">
                <span
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    job.status === 'completed' || job.status === 'done'
                      ? 'bg-emerald-500'
                      : isActive
                        ? 'bg-turquoise-500'
                        : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => onSelect(job)}
                  className="flex-1 min-w-0 text-left group"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-turquoise-700 dark:group-hover:text-turquoise-300">
                      {job.title || job.jobName || 'Trabajo'}
                    </span>
                    {isActive && <Pill variant="info">En curso</Pill>}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {wName} · {formatRelativeShort(toDate(job.createdAt))}
                    {job.totalMinutes != null && ` · ${Math.floor(job.totalMinutes / 60)}h ${job.totalMinutes % 60}m`}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function ReportesResumenCard({ reports, onGenerate, onSelect }) {
  const items = useMemo(() => {
    return [...reports]
      .map((r) => ({ r, d: toDate(r.createdAt) }))
      .filter((x) => x.d)
      .sort((a, b) => b.d - a.d)
      .slice(0, 4)
      .map(({ r, d }) => ({
        key: r.id,
        report: r,
        label: (() => {
          const lbl = format(d, 'MMMM yyyy', { locale: es });
          return lbl.charAt(0).toUpperCase() + lbl.slice(1);
        })(),
        sent: !!r.sentAt || r.status === 'sent',
        date: d,
      }));
  }, [reports]);

  if (items.length === 0) return null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">Reportes</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {items.length} reporte{items.length === 1 ? '' : 's'} para el propietario
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onGenerate}>
          Ver todos
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {items.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onSelect?.(m.report)}
            className="text-left rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3 hover:border-turquoise-300 hover:bg-[var(--color-surface-subtle)] dark:hover:bg-stone-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <FileText className="w-4 h-4 text-stone-400 mt-0.5" />
              {m.sent ? <Pill variant="resolved">Enviado</Pill> : <Pill variant="medium">Borrador</Pill>}
            </div>
            <p className="font-medium text-sm text-stone-900 dark:text-stone-100 mt-2">{m.label}</p>
            <p className="text-[11px] text-stone-400 mt-0.5 font-mono tabular-nums">
              {format(m.date, 'd MMM', { locale: es })}
            </p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function ResumenTab({
  house, jobs, incidences, checklists, reports,
  onSelectIncidence, onSelectChecklist, onSelectJob, onSelectReport,
  onTabChange, onNewJob, onNewIncidence, onNewChecklist,
}) {
  return (
    <div className="space-y-5">
      <HeroPhoto house={house} />
      <KpiStrip
        qualityAvg={(() => {
          const scored = checklists.filter((c) => (c.total ?? 0) > 0);
          if (scored.length === 0) return null;
          return scored.reduce((s, c) => s + ((c.done ?? 0) / c.total) * 100, 0) / scored.length;
        })()}
        incidences30d={incidences.length}
        openInc={incidences.filter((i) => !i.done).length}
        closedInc={incidences.filter((i) => i.done).length}
        trabajosTotal={jobs.length}
        trabajosActivos={jobs.filter((j) => j.status === 'pending' || j.status === 'in_progress').length}
        trabajosCompletados={jobs.filter((j) => j.status === 'completed' || j.status === 'done').length}
        revisionesTotal={checklists.length}
        revisionesPendientes={checklists.filter((c) => !c.finished).length}
        ultimaRevision={(() => {
          const dates = checklists.map((c) => toDate(c.date)).filter(Boolean).sort((a, b) => b - a);
          if (dates.length === 0) return null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const last = new Date(dates[0]);
          last.setHours(0, 0, 0, 0);
          return Math.round((today - last) / (1000 * 60 * 60 * 24));
        })()}
        avgJobMinutes={(() => {
          const withMinutes = jobs.filter((j) => j.totalMinutes != null && j.totalMinutes > 0);
          if (withMinutes.length === 0) return null;
          return withMinutes.reduce((s, j) => s + j.totalMinutes, 0) / withMinutes.length;
        })()}
      />
      <IncidenciasResumenCard
        incidences={incidences}
        onSelect={onSelectIncidence}
        onTabChange={onTabChange}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RevisionesResumenCard checklists={checklists} onSelect={onSelectChecklist} onNewChecklist={onNewChecklist} />
        <TrabajosResumenCard jobs={jobs} onSelect={onSelectJob} onNewJob={onNewJob} />
      </div>
      <ReportesResumenCard reports={reports} onGenerate={() => onTabChange('reportes')} onSelect={onSelectReport} />
    </div>
  );
}

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
  const sorted = useMemo(
    () => [...jobs].sort((a, b) => (toDate(b.date || b.createdAt)?.getTime() ?? 0) - (toDate(a.date || a.createdAt)?.getTime() ?? 0)),
    [jobs]
  );
  const active = jobs.filter((j) => j.status === 'in_progress' || j.status === 'pending').length;
  const completed = jobs.filter((j) => j.status === 'completed' || j.status === 'done').length;

  const STATUS_VARIANT = {
    pending: 'medium',
    in_progress: 'info',
    done: 'resolved',
    completed: 'resolved',
    cancelled: 'neutral',
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
              Trabajos <span className="text-stone-400 font-normal">{jobs.length}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {active} activo{active === 1 ? '' : 's'} · {completed} completado{completed === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onNewJob}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nuevo trabajo
        </Button>
      </div>
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Sin trabajos"
          description="Asigna un trabajo a esta propiedad para hacerle seguimiento desde aquí."
          action={
            <Button size="sm" onClick={onNewJob}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Crear trabajo
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
        <table className="dt-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 320 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Trabajo</th>
              <th>Estado</th>
              <th>Trabajadores</th>
              <th style={{ textAlign: 'right' }}>Duración</th>
              <th style={{ textAlign: 'right' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((job) => {
              const status = job.status || 'pending';
              const ws = job.workers || [];
              const totalMin = job.totalMinutes;
              return (
                <tr key={job.id} className="is-clickable" onClick={() => onSelectJob(job)}>
                  <td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-600 dark:text-turquoise-300 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {job.title || job.jobName || 'Trabajo'}
                        </p>
                        {job.observations && (
                          <p className="text-[11px] text-stone-400 truncate">{job.observations}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <Pill variant={STATUS_VARIANT[status] ?? 'neutral'} dot>{statusLabels[status] ?? status}</Pill>
                  </td>
                  <td>
                    {ws.length === 0 ? (
                      <span className="text-stone-400 text-xs">Sin asignar</span>
                    ) : (
                      <div className="flex items-center -space-x-1.5">
                        {ws.slice(0, 3).map((w, i) => (
                          <span
                            key={w.id || i}
                            title={`${w.firstName ?? ''} ${w.lastName ?? ''}`.trim()}
                            className="w-6 h-6 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--surface-elevated)]"
                          >
                            {(w.firstName || '?').charAt(0).toUpperCase()}
                          </span>
                        ))}
                        {ws.length > 3 && <span className="ml-2 text-xs text-stone-500">+{ws.length - 3}</span>}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {totalMin != null && totalMin > 0 ? (
                      <span className="font-mono tabular-nums text-xs text-stone-700 dark:text-stone-200">
                        {Math.floor(totalMin / 60)}h {String(totalMin % 60).padStart(2, '0')}m
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono tabular-nums text-xs text-stone-500">
                      {formatRelativeShort(toDate(job.date || job.createdAt))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </Card>
  );
}

function IncidenciasTab({ incidences, onSelectIncidence, onNewIncidence }) {
  const sorted = useMemo(
    () => [...incidences].sort((a, b) => (toDate(b.date || b.createdAt)?.getTime() ?? 0) - (toDate(a.date || a.createdAt)?.getTime() ?? 0)),
    [incidences]
  );
  const open = incidences.filter((i) => !i.done).length;
  const inProgress = incidences.filter((i) => !i.done && i.state === 'in_progress').length;
  const closed = incidences.filter((i) => i.done).length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
              Incidencias <span className="text-stone-400 font-normal">{incidences.length}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {open} abierta{open === 1 ? '' : 's'} · {inProgress} en curso · {closed} resuelta{closed === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onNewIncidence}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nueva incidencia
        </Button>
      </div>
      {incidences.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="Sin incidencias"
          description="Las incidencias reportadas en esta propiedad aparecerán aquí."
          action={
            <Button size="sm" onClick={onNewIncidence}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Reportar incidencia
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
        <table className="dt-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 320 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 170 }} />
            <col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Incidencia</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Asignado</th>
              <th style={{ textAlign: 'right' }}>Cuándo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inc) => {
              const w = inc.workers?.[0];
              const wName = w ? `${w.firstName ?? ''} ${w.lastName ?? ''}`.trim() : null;
              return (
                <tr key={inc.id} className="is-clickable" onClick={() => onSelectIncidence(inc)}>
                  <td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        inc.priority === 'critical' ? 'bg-red-500' :
                        inc.priority === 'high' ? 'bg-orange-500' :
                        inc.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {inc.title || 'Sin título'}
                        </p>
                        {inc.category && (
                          <p className="text-[11px] text-stone-400 truncate">{inc.category}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {inc.priority ? (
                      <Pill variant={PRIORITY_VARIANT[inc.priority] ?? 'neutral'} dot>
                        {PRIORITY_LABEL[inc.priority] ?? inc.priority}
                      </Pill>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    {inc.done ? (
                      <Pill variant="resolved">Resuelta</Pill>
                    ) : inc.state === 'in_progress' ? (
                      <Pill variant="info">En curso</Pill>
                    ) : (
                      <Pill variant="critical">Abierta</Pill>
                    )}
                  </td>
                  <td>
                    {wName ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-200">
                        <span className="w-5 h-5 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center">
                          {(w.firstName || '?').charAt(0).toUpperCase()}
                          {(w.lastName || '').charAt(0).toUpperCase()}
                        </span>
                        {wName}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono tabular-nums text-xs text-stone-500">
                      {formatRelativeShort(toDate(inc.date || inc.createdAt))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </Card>
  );
}

function RevisionesTab({ checklists, onSelectChecklist, onNewChecklist }) {
  const sorted = useMemo(
    () => [...checklists].sort((a, b) => (toDate(b.date)?.getTime() ?? 0) - (toDate(a.date)?.getTime() ?? 0)),
    [checklists]
  );
  const finished = checklists.filter((c) => c.finished).length;
  const inProgress = checklists.length - finished;
  const avg = useMemo(() => {
    const scored = checklists.filter((c) => (c.total ?? 0) > 0);
    if (scored.length === 0) return null;
    return Math.round(
      scored.reduce((s, c) => s + ((c.done ?? 0) / c.total) * 100, 0) / scored.length
    );
  }, [checklists]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
              Revisiones <span className="text-stone-400 font-normal">{checklists.length}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {finished} finalizada{finished === 1 ? '' : 's'} · {inProgress} en curso
              {avg != null && ` · puntuación media ${avg}`}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onNewChecklist}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nueva revisión
        </Button>
      </div>
      {checklists.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin revisiones"
          description="Programa la primera revisión para llevar el control de calidad de la propiedad."
          action={
            <Button size="sm" onClick={onNewChecklist}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Programar revisión
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
        <table className="dt-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 84 }} />
            <col style={{ width: 240 }} />
            <col style={{ width: 170 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 90 }} />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Revisión</th>
              <th>Puntuación</th>
              <th style={{ textAlign: 'right' }}>Notas</th>
              <th style={{ textAlign: 'right' }}>Pend.</th>
              <th>Estado</th>
              <th>Trabajador</th>
              <th style={{ textAlign: 'right' }}>Duración</th>
              <th style={{ textAlign: 'right' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cl) => {
              const d = toDate(cl.date);
              const dEnd = toDate(cl.finishedAt || cl.completedAt);
              const done = cl.done ?? 0;
              const total = cl.total ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : null;
              const pending = total > 0 ? Math.max(0, total - done) : null;
              const notesCount = Array.isArray(cl.notes)
                ? cl.notes.length
                : Array.isArray(cl.itemsWithNotes)
                ? cl.itemsWithNotes.length
                : (cl.notesCount ?? (cl.observations ? 1 : 0));
              const ws = cl.workers || [];
              const durationMin =
                dEnd && d ? Math.max(0, Math.round((dEnd - d) / 60000)) : (cl.durationMinutes ?? null);
              const refId = `REV-${(cl.id || '').slice(-4).toUpperCase()}`;
              return (
                <tr key={cl.id} className="is-clickable" onClick={() => onSelectChecklist(cl)}>
                  <td className="font-mono tabular-nums text-xs text-stone-500">{refId}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-600 dark:text-turquoise-300 flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {d ? format(d, "d 'de' MMMM yyyy", { locale: es }) : 'Revisión'}
                        </p>
                        {cl.observations && (
                          <p className="text-[11px] text-stone-400 truncate">{cl.observations}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {total > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-xs text-stone-700 dark:text-stone-200 w-12 text-right">
                          {done}/{total}
                        </span>
                        <QualityBar value={pct} showValue={false} />
                        <span className="font-mono tabular-nums text-xs text-stone-500 w-7 text-right">{pct}</span>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-xs">Sin puntos</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {notesCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-xs text-stone-700 dark:text-stone-200">
                        <FileText className="w-3 h-3 text-stone-400" />
                        {notesCount}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {pending == null ? (
                      <span className="text-stone-400 text-xs">—</span>
                    ) : pending === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle className="w-3 h-3" />
                        OK
                      </span>
                    ) : (
                      <span className="font-mono tabular-nums text-xs text-amber-700 dark:text-amber-300">
                        {pending}
                      </span>
                    )}
                  </td>
                  <td>
                    {cl.finished ? (
                      <Pill variant="resolved">Finalizada</Pill>
                    ) : (
                      <Pill variant="info">En curso</Pill>
                    )}
                  </td>
                  <td>
                    {ws.length === 0 ? (
                      <span className="text-stone-400 text-xs">—</span>
                    ) : ws.length === 1 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-200">
                        <span className="w-5 h-5 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center">
                          {(ws[0].firstName || '?').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">
                          {(ws[0].firstName || '').slice(0, 1)}. {ws[0].lastName || ''}
                        </span>
                      </span>
                    ) : (
                      <div className="flex items-center -space-x-1.5">
                        {ws.slice(0, 3).map((w, i) => (
                          <span
                            key={w.id || i}
                            title={`${w.firstName ?? ''} ${w.lastName ?? ''}`.trim()}
                            className="w-6 h-6 rounded-full bg-turquoise-100 dark:bg-turquoise-900/40 text-turquoise-700 dark:text-turquoise-300 text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--surface-elevated)]"
                          >
                            {(w.firstName || '?').charAt(0).toUpperCase()}
                          </span>
                        ))}
                        {ws.length > 3 && <span className="ml-2 text-xs text-stone-500">+{ws.length - 3}</span>}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {durationMin != null && durationMin > 0 ? (
                      <span className="font-mono tabular-nums text-xs text-stone-700 dark:text-stone-200">
                        {durationMin >= 60
                          ? `${Math.floor(durationMin / 60)}h ${String(durationMin % 60).padStart(2, '0')}m`
                          : `${durationMin}m`}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono tabular-nums text-xs text-stone-500">
                      {formatRelativeShort(d)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </Card>
  );
}

function ReportesTab({ houseId }) {
  const { data: allReports = [], isLoading } = useInspectionReports();
  const { data: houses = [] } = useHouses();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const reports = useMemo(
    () => [...allReports]
      .filter((r) => r.propertyId === houseId || r.houseId === houseId)
      .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)),
    [allReports, houseId]
  );
  const selectedReport = useMemo(
    () => (selectedReportId ? allReports.find((r) => r.id === selectedReportId) : null),
    [selectedReportId, allReports]
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
              Reportes <span className="text-stone-400 font-normal">{reports.length}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Reportes de inspección generados desde el bot</p>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">Cargando…</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin reportes"
          description="Los reportes de inspección se generan desde el bot de Telegram al revisar la propiedad."
        />
      ) : (
        <div className="overflow-x-auto">
        <table className="dt-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 350 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Reporte</th>
              <th>Atención</th>
              <th>Incidencias</th>
              <th style={{ textAlign: 'right' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const d = toDate(r.createdAt);
              const requiresImmediate = r.pipelineResult?.summary?.requiresImmediateAction;
              const summary = r.pipelineResult?.summary?.transcriptionSummary || r.summary;
              const issuesCount = r.issues?.length ?? 0;
              return (
                <tr
                  key={r.id}
                  className={`is-clickable ${selectedReportId === r.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedReportId(r.id)}
                >
                  <td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-turquoise-50 dark:bg-turquoise-900/30 text-turquoise-600 dark:text-turquoise-300 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {d ? format(d, "d 'de' MMMM yyyy", { locale: es }) : 'Reporte'}
                        </p>
                        {summary && (
                          <p className="text-[11px] text-stone-400 truncate">{summary}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {requiresImmediate ? (
                      <Pill variant="critical" dot>Inmediata</Pill>
                    ) : (
                      <Pill variant="resolved">Normal</Pill>
                    )}
                  </td>
                  <td>
                    <span className={`font-mono tabular-nums text-sm ${issuesCount === 0 ? 'text-stone-400' : 'text-stone-700 dark:text-stone-200'}`}>
                      {issuesCount}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono tabular-nums text-xs text-stone-500">
                      {formatRelativeShort(d)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          houses={houses}
          onClose={() => setSelectedReportId(null)}
          onCreatedIncidences={() => setSelectedReportId(null)}
          onDeleted={() => setSelectedReportId(null)}
        />
      )}
    </Card>
  );
}

// ——— Página principal ———

export default function HouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: houses = [] } = useHouses();
  const house = houses.find((h) => h.id === id);

  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
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

  const qualityAvg = useMemo(() => {
    const scored = checklists
      .filter((cl) => (cl.total ?? 0) > 0)
      .map((cl) => ((cl.done ?? 0) / cl.total) * 100);
    if (scored.length === 0) return null;
    return scored.reduce((a, b) => a + b, 0) / scored.length;
  }, [checklists]);

  const qualityTrend = useMemo(() => {
    return checklists
      .filter((cl) => (cl.total ?? 0) > 0)
      .map((cl) => ({ d: toDate(cl.date)?.getTime() ?? 0, value: ((cl.done ?? 0) / cl.total) * 100 }))
      .sort((a, b) => a.d - b.d)
      .slice(-7);
  }, [checklists]);

  const incidences30d = useMemo(() => {
    const cutoff = nowTs - 30 * 24 * 60 * 60 * 1000;
    return incidences.filter((i) => {
      const d = toDate(i.date || i.createdAt);
      return d && d.getTime() >= cutoff;
    }).length;
  }, [incidences, nowTs]);

  const completedJobsCount = useMemo(
    () => jobs.filter((j) => j.status === 'completed' || j.status === 'done').length,
    [jobs]
  );

  const handleEdit = () => {
    navigate('/casas', { state: { openHouseId: id } });
  };

  const tabBadges = useMemo(() => ({
    incidencias: incidences.length || null,
    revisiones: checklists.length || null,
    trabajos: jobs.length || null,
    reportes: houseReports.length || null,
  }), [jobs.length, incidences.length, checklists.length, houseReports.length]);

  const isOccupied = pendingJobs > 0 || openIncidences > 0;

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

  const ownerInitial = house.owner
    ? `${(house.owner.firstName || '').charAt(0)}${(house.owner.lastName || '').charAt(0)}`.toUpperCase()
    : '?';

  const internalRef = `CM-${(house.id || '').slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mb-2">
            <Link to="/casas" className="inline-flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Gestión
            </Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link to="/casas" className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors">Casas</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-stone-700 dark:text-stone-200 font-medium truncate">
              {house.houseName || 'Sin nombre'}
            </span>
          </nav>
          <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-tight truncate">
            {house.houseName || 'Sin nombre'}
          </h1>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5 text-sm text-stone-600 dark:text-stone-300">
            {isOccupied ? (
              <Pill variant="resolved">Ocupada</Pill>
            ) : (
              <Pill variant="neutral">Disponible</Pill>
            )}
            {(house.street || house.municipio) && (
              <span className="inline-flex items-center gap-1 text-stone-500">
                <MapPin className="w-3.5 h-3.5" />
                {[house.street, house.municipio].filter(Boolean).join(', ')}
              </span>
            )}
            {house.owner && (
              <>
                <span className="text-stone-300 dark:text-stone-600">·</span>
                <span className="text-stone-500">Propietario:</span>
                <Link
                  to={`/propietarios/${house.owner.id}`}
                  className="font-medium text-stone-700 dark:text-stone-200 hover:text-turquoise-700 dark:hover:text-turquoise-300"
                >
                  {house.owner.firstName} {house.owner.lastName}
                </Link>
              </>
            )}
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <span className="font-mono tabular-nums text-stone-400 text-xs">{internalRef}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowNewJob(true)}>
            <Briefcase className="w-4 h-4 mr-1.5" />
            Crear trabajo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowNewChecklist(true)}>
            <CheckSquare className="w-4 h-4 mr-1.5" />
            Programar revisión
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewIncidence(true)}
            className="!bg-amber-50 !text-amber-700 hover:!bg-amber-100 !border !border-amber-200 dark:!bg-amber-900/20 dark:!text-amber-300 dark:!border-amber-800/40"
          >
            <AlertCircle className="w-4 h-4 mr-1.5" />
            Reportar incidencia
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-soft)]">
        <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-turquoise-500 text-turquoise-700 dark:text-turquoise-300'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {tab.label}
              {tabBadges[tab.id] != null && (
                <span className={`text-[10px] font-mono tabular-nums rounded-full px-1.5 py-px ${activeTab === tab.id ? 'bg-turquoise-100/70 dark:bg-turquoise-900/40 text-turquoise-800 dark:text-turquoise-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                  {tabBadges[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna principal — full width en pestañas con tablas */}
        <div className={`${activeTab === 'resumen' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5`}>
          {activeTab === 'resumen' && (
            <ResumenTab
              house={house}
              jobs={jobs}
              incidences={incidences}
              checklists={checklists}
              reports={houseReports}
              onSelectIncidence={setSelectedIncidence}
              onSelectChecklist={setSelectedChecklist}
              onSelectJob={setSelectedJob}
              onSelectReport={setSelectedReport}
              onTabChange={setActiveTab}
              onNewJob={() => setShowNewJob(true)}
              onNewIncidence={() => setShowNewIncidence(true)}
              onNewChecklist={() => setShowNewChecklist(true)}
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
          {activeTab === 'trabajos' && (
            <TrabajosTab
              jobs={jobs}
              onSelectJob={setSelectedJob}
              onNewJob={() => setShowNewJob(true)}
            />
          )}
          {activeTab === 'reportes' && <ReportesTab houseId={id} />}
          {activeTab === 'documentos' && (
            <Card className="p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">Documentos</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Contratos, planos, manuales y otros archivos de la propiedad</p>
                </div>
                <Button size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Subir documento
                </Button>
              </div>
              {(house.documents?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={FolderClosed}
                  title="Sin documentos"
                  description="Sube los documentos de la propiedad para tenerlos accesibles desde aquí."
                />
              ) : (
                <ul className="divide-y divide-[var(--border-soft)]">
                  {house.documents.map((doc) => (
                    <li key={doc.id || doc.name} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--row-hover)] transition-colors">
                      <FileText className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{doc.name}</p>
                        <p className="text-[11px] text-stone-400 font-mono tabular-nums">
                          {doc.size || ''}
                          {doc.size && doc.uploadedAt ? ' · ' : ''}
                          {doc.uploadedAt ? format(toDate(doc.uploadedAt), 'd MMM yyyy', { locale: es }) : ''}
                        </p>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-turquoise-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar derecha — solo en Resumen */}
        {activeTab === 'resumen' && (
        <aside className="lg:col-span-4 space-y-4">
          {/* Detalles */}
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-[var(--border-soft)] flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Detalles</h3>
              <button onClick={handleEdit} className="text-stone-400 hover:text-turquoise-600 transition-colors" title="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <dl className="px-5 py-4 space-y-2.5 text-sm">
              <DetailRow label="Ref interna" value={internalRef} mono />
              <DetailRow label="Habitaciones" value={house.bedrooms ?? '—'} mono />
              <DetailRow label="Baños" value={house.bathrooms ?? '—'} mono />
              <DetailRow
                label="Superficie"
                value={house.surface ? `${house.surface} m²` : '—'}
                mono
              />
              <DetailRow
                label="Capacidad"
                value={house.capacity ? `${house.capacity} huéspedes` : '—'}
              />
              <DetailRow label="Mascotas" value={house.allowsPets ? 'Sí' : 'No'} />
              {(house.wifiSsid || house.wifiPassword) && (
                <DetailRow
                  label="Wifi"
                  value={`${house.wifiSsid || '—'} / ${house.wifiPassword || '—'}`}
                  mono
                />
              )}
              {house.keys && <DetailRow label="Llaves" value={house.keys} mono />}
              {house.notes && (
                <div className="pt-2 border-t border-[var(--border-soft)]">
                  <dt className="text-stone-500 mb-1 text-xs">Notas</dt>
                  <dd className="text-stone-700 dark:text-stone-300 text-sm">{house.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Mini-mapa */}
          <Card className="p-0 overflow-hidden">
            <HouseLocationMap house={house} height="h-40" />
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-[var(--border-soft)]">
              <span className="text-[11px] text-stone-500 inline-flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {[house.street, house.municipio].filter(Boolean).join(', ') || 'Sin ubicación'}
                  {house.location?.latitude && ` · ${Number(house.location.latitude).toFixed(4)}, ${Number(house.location.longitude).toFixed(4)}`}
                </span>
              </span>
              {house.location?.latitude && (
                <a
                  href={`https://www.google.com/maps?q=${house.location.latitude},${house.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-turquoise-700 dark:text-turquoise-300 hover:underline inline-flex items-center gap-0.5 flex-shrink-0 ml-2"
                >
                  Abrir mapa <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>

          {/* Propietario */}
          {house.owner && (
            <Card className="p-0">
              <div className="px-5 py-3.5 border-b border-[var(--border-soft)]">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Propietario</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-turquoise-600) 100%)' }}
                  >
                    {ownerInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/propietarios/${house.owner.id}`}
                      className="font-medium text-stone-900 dark:text-stone-100 hover:text-turquoise-700 dark:hover:text-turquoise-300 truncate block"
                    >
                      {house.owner.firstName} {house.owner.lastName}
                    </Link>
                    {house.owner.email && (
                      <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                        {house.owner.email}
                      </p>
                    )}
                  </div>
                  <Link to={`/propietarios/${house.owner.id}`} className="text-stone-400 hover:text-turquoise-600">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {house.owner.phone && (
                    <a
                      href={`tel:${house.owner.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-[var(--border)] text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Llamar
                    </a>
                  )}
                  {house.owner.email && (
                    <a
                      href={`mailto:${house.owner.email}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-[var(--border)] text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Documentos */}
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-[var(--border-soft)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderClosed className="w-3.5 h-3.5 text-stone-400" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Documentos</h3>
              </div>
              <button
                type="button"
                className="w-6 h-6 rounded-md flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Subir documento"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {(house.documents?.length ?? 0) === 0 ? (
              <div className="px-5 py-6 text-center">
                <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-2 text-stone-400">
                  <FolderClosed className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <p className="text-xs text-stone-500">Sin documentos</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Sube contratos, planos, manuales…</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-soft)]">
                {house.documents.map((doc) => (
                  <li key={doc.id || doc.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--row-hover)] transition-colors">
                    <FileText className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{doc.name}</p>
                      <p className="text-[11px] text-stone-400 font-mono tabular-nums">
                        {doc.size || ''}
                        {doc.size && doc.uploadedAt ? ' · ' : ''}
                        {doc.uploadedAt ? format(toDate(doc.uploadedAt), 'd MMM', { locale: es }) : ''}
                      </p>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-turquoise-600 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Actividad */}
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-[var(--border-soft)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-stone-400" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Actividad</h3>
              </div>
              <span className="text-[11px] text-stone-400">Cronología completa</span>
            </div>
            <ActivityTimeline jobs={jobs} incidences={incidences} checklists={checklists} reports={houseReports} />
          </Card>
        </aside>
        )}
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
      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          houses={houses}
          onClose={() => setSelectedReport(null)}
          onCreatedIncidences={() => setSelectedReport(null)}
          onDeleted={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
