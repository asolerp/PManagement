import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useJobs, useHouses, useCreateJob, useWorkersFirestore, useUpdateJob, useDeleteJob, useAddActivity, useSettings } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Briefcase, Plus, User, Home, X, Calendar, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getJobSlaStatus } from '@/utils/sla';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Timeline from '@/components/Timeline';

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Finalizado',
  cancelled: 'Cancelado'
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-[#126D9B]/10 text-[#126D9B]',
  done: 'bg-[#67B26F]/10 text-[#67B26F]',
  cancelled: 'bg-gray-100 text-gray-600'
};

const JOB_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'done', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

function JobDetailPanel({ job, houses = [], onClose, onJobUpdated, onDeleted }) {
  const { user, userData } = useAuth();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const addActivity = useAddActivity();
  const { data: workers = [] } = useWorkersFirestore();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editObservations, setEditObservations] = useState('');
  const [editHouseId, setEditHouseId] = useState('');
  const [editDateValue, setEditDateValue] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [editWorkerIds, setEditWorkerIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (job) {
      setEditTitle(job.title || job.jobName || '');
      setEditObservations(job.observations || '');
      setEditHouseId(job.houseId || '');
      const d = job.date?.toDate?.() || job.date || job.createdAt?.toDate?.() || new Date();
      setEditDateValue(format(new Date(d), 'yyyy-MM-dd'));
      setEditStatus(job.status || 'pending');
      setEditWorkerIds(new Set((job.workersId || []).filter(Boolean)));
    }
  }, [job]);

  const handleStartEdit = () => {
    setEditTitle(job.title || job.jobName || '');
    setEditObservations(job.observations || '');
    setEditHouseId(job.houseId || '');
    const d = job.date?.toDate?.() || job.date || job.createdAt?.toDate?.() || new Date();
    setEditDateValue(format(new Date(d), 'yyyy-MM-dd'));
    setEditStatus(job.status || 'pending');
    setEditWorkerIds(new Set((job.workersId || []).filter(Boolean)));
    setIsEditing(true);
    setShowDeleteConfirm(false);
    setError(null);
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!editTitle.trim() || !editHouseId) return;
    setError(null);
    const house = houses.find((h) => h.id === editHouseId);
    const selectedWorkers = workers.filter((w) => editWorkerIds.has(w.id));
    try {
      await updateJob.mutateAsync({
        id: job.id,
        title: editTitle.trim(),
        jobName: editTitle.trim(),
        observations: editObservations.trim() || null,
        houseId: editHouseId,
        house: house || null,
        workers: selectedWorkers.length > 0 ? selectedWorkers : null,
        workersId: selectedWorkers.map((w) => w.id),
        date: editDateValue ? new Date(editDateValue) : undefined,
        status: editStatus,
        done: editStatus === 'done',
      });
      onJobUpdated?.({ ...job, title: editTitle.trim(), jobName: editTitle.trim(), observations: editObservations.trim() || null, houseId: editHouseId, house, workers: selectedWorkers, workersId: selectedWorkers.map((w) => w.id), date: editDateValue, status: editStatus, done: editStatus === 'done' });
      setIsEditing(false);
    } catch (err) {
      setError(err?.message ?? 'Error al guardar');
    }
  };

  const toggleEditWorker = (id) => {
    setEditWorkerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    setError(null);
    try {
      await deleteJob.mutateAsync(job.id);
      setShowDeleteConfirm(false);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Error al eliminar');
    }
  };

  const handleStatusChange = async (e) => {
    const toStatus = e.target.value;
    if (!toStatus || toStatus === (job.status || 'pending')) return;
    const fromStatus = job.status || 'pending';
    const fromDone = job.done || fromStatus === 'done';
    const toDone = toStatus === 'done';
    const userPayload = user && userData
      ? { uid: user.uid, firstName: userData.firstName, lastName: userData.lastName }
      : null;
    try {
      await updateJob.mutateAsync({ id: job.id, status: toStatus, done: toDone });
      await addActivity.mutateAsync({
        collectionName: 'jobs',
        docId: job.id,
        type: 'state_change',
        fromState: fromStatus,
        toState: toStatus,
        fromDone,
        toDone,
        user: userPayload,
      });
      onJobUpdated?.({ ...job, status: toStatus, done: toDone });
    } catch (err) {
      console.error('Error al actualizar estado', err);
    }
  };

  const status = job.status || 'pending';
  const houseName = job.house?.[0]?.houseName || job.house?.houseName || 'Casa';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#126D9B]/10 text-[#126D9B]">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Trabajo</h2>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && !showDeleteConfirm && (
              <>
                <button type="button" onClick={handleStartEdit} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Editar">
                  <Pencil className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Eliminar">
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-900">¿Eliminar este trabajo? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button onClick={handleDeleteConfirm} disabled={deleteJob.isPending} className="bg-red-600 hover:bg-red-700">
                {deleteJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>
          )}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="px-6 py-5 space-y-4">
              <Input label="Título *" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Ej: Reparación persiana" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea value={editObservations} onChange={(e) => setEditObservations(e.target.value)} placeholder="Detalles..." rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
                <select value={editHouseId} onChange={(e) => setEditHouseId(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]">
                  <option value="">Seleccionar propiedad</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>{h.houseName || 'Sin nombre'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]">
                  {JOB_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trabajadores</label>
                {workers.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay trabajadores.</p>
                ) : (
                  <ul className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {workers.map((w) => {
                      const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email || 'Sin nombre';
                      return (
                        <li key={w.id}>
                          <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={editWorkerIds.has(w.id)} onChange={() => toggleEditWorker(w.id)} className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]" />
                            <span className="text-sm text-gray-900">{name}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={updateJob.isPending || !editTitle.trim() || !editHouseId}>
                  {updateJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
            </form>
          ) : (
          <div className="px-6 py-5 border-b border-gray-100 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{job.title || job.jobName || 'Sin título'}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              {getJobSlaStatus(job) && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  getJobSlaStatus(job).status === 'breached' ? 'bg-red-50 text-red-700' :
                  getJobSlaStatus(job).status === 'at_risk' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {getJobSlaStatus(job).label}
                </span>
              )}
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={updateJob.isPending}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#126D9B] bg-white"
              >
                {JOB_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {job.houseId && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4 text-gray-400" />
                <Link to={`/casas/${job.houseId}`} className="text-[#126D9B] hover:underline">{houseName}</Link>
              </div>
            )}
            {(job.createdAt?.toDate || job.date) && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                {format(job.createdAt?.toDate?.() || job.date?.toDate?.() || job.date || new Date(), "d MMM yyyy", { locale: es })}
              </div>
            )}
            {job.observations && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg bg-gray-50 p-3">{job.observations}</p>
              </div>
            )}
            {(job.workers || []).length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Trabajadores</p>
                <div className="flex flex-wrap gap-2">
                  {(job.workers || []).map((w, i) => (
                    <Link
                      key={w.id || i}
                      to={w.id ? `/trabajadores/${w.id}` : '#'}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <User className="w-3 h-3" />
                      {`${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Trabajador'}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Historial</h3>
            <Timeline
              collectionName="jobs"
              docId={job.id}
              showCommentForm
              emptyMessage="Sin comentarios ni cambios de estado aún."
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export default function JobsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const { data: jobs = [], isLoading } = useJobs();
  const { data: houses = [] } = useHouses();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Trabajos</h1>
          <p className="text-gray-500">
            Trabajos o tareas asignadas a casas y trabajadores
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo trabajo
        </Button>
      </div>

      {!isLoading && jobs.length > 0 && (
        <p className="text-sm text-gray-500">
          {jobs.length} trabajo{jobs.length !== 1 ? 's' : ''}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#126D9B]/20 to-[#67B26F]/20 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-[#126D9B]" />
          </div>
          <p className="font-heading text-gray-800 font-medium mb-1">No hay trabajos</p>
          <p className="text-sm text-gray-500">Los trabajos creados aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const status = job.status || 'pending';
            const label = statusLabels[status] || status;
            const colorClass = statusColors[status] || statusColors.pending;
            const slaInfo = getJobSlaStatus(job);
            const slaClass = slaInfo
              ? { ok: 'bg-emerald-50 text-emerald-700', at_risk: 'bg-amber-50 text-amber-700', breached: 'bg-red-50 text-red-700' }[slaInfo.status]
              : null;
            return (
              <Card
                key={job.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#126D9B]/10 text-[#126D9B]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {job.title || job.jobName || 'Sin título'}
                    </p>
                    {job.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}
                      >
                        {label}
                      </span>
                      {slaInfo && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${slaClass}`} title={slaInfo.label}>
                          {slaInfo.label}
                        </span>
                      )}
                      {job.houseId && (
                        <Link
                          to={`/casas/${job.houseId}`}
                          className="inline-flex items-center gap-1 text-xs text-[#126D9B] hover:underline"
                        >
                          <Home className="w-3 h-3" />
                          {job.house?.[0]?.houseName || job.house?.houseName || 'Casa'}
                        </Link>
                      )}
                      {(job.workers || []).map((w, i) => (
                        <Link
                          key={w.id || i}
                          to={w.id ? `/trabajadores/${w.id}` : '#'}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${w.id ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}`}
                        >
                          <User className="w-3 h-3" />
                          {`${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Trabajador'}
                        </Link>
                      ))}
                      {job.createdAt?.toDate && (
                        <span className="text-xs text-gray-400">
                          {format(job.createdAt.toDate(), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateJobModal
          houses={houses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}

      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          houses={houses}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={(updated) => setSelectedJob(updated)}
          onDeleted={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

function CreateJobModal({ houses, onClose, onCreated }) {
  const createJob = useCreateJob();
  const { user, userData } = useAuth();
  const { data: settings } = useSettings();
  const { data: workers = [] } = useWorkersFirestore();
  const [title, setTitle] = useState('');
  const [observations, setObservations] = useState('');
  const [houseId, setHouseId] = useState('');
  const [dateValue, setDateValue] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());

  const house = houses.find((h) => h.id === houseId);
  const selectedWorkers = workers.filter((w) => selectedWorkerIds.has(w.id));
  const canSubmit = title.trim() && houseId;

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
    try {
      await createJob.mutateAsync({
        title: title.trim(),
        jobName: title.trim(),
        observations: observations.trim() || undefined,
        houseId: house.id,
        house: house,
        workers: selectedWorkers.length > 0 ? selectedWorkers : undefined,
        workersId: selectedWorkers.map((w) => w.id),
        date: dateValue,
        createdBy: user && userData ? { uid: user.uid, email: userData.email || '' } : undefined,
        slaResolutionHours: settings?.slaJobResolutionHours ?? 120,
      });
      onCreated();
    } catch (err) {
      console.error('Error creating job', err);
    }
  };

  return (
    <Modal open onClose={onClose} title="Nuevo trabajo">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Título *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Reparación persiana"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Detalles del trabajo..."
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            required
          >
            <option value="">Seleccionar propiedad</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.houseName || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Trabajadores (opcional)
          </label>
          {workers.length === 0 ? (
            <p className="text-sm text-gray-500 rounded-lg px-3 py-2 bg-gray-50">
              No hay trabajadores. Añádelos en Trabajadores.
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {workers.map((w) => {
                const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email || 'Sin nombre';
                return (
                  <li key={w.id}>
                    <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWorkerIds.has(w.id)}
                        onChange={() => toggleWorker(w.id)}
                        className="rounded border-gray-300 text-[#126D9B] focus:ring-[#126D9B]"
                      />
                      <span className="text-sm text-gray-900">{name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit || createJob.isPending}>
            {createJob.isPending ? 'Creando…' : 'Crear trabajo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
