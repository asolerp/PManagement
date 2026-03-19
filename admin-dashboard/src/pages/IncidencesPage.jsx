import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useIncidences, useHouses, useCreateIncidence, useUpdateIncidence, useDeleteIncidence, useAddActivity, useWorkersFirestore, useSettings } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';
import Timeline from '@/components/Timeline';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
  Home,
  Calendar,
  User,
  Camera,
  Clock,
  Plus,
  Hourglass,
  UserX,
  Trash2,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { getIncidenceSlaStatus, getIncidenceStaleInfo } from '@/utils/sla';


function formatDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') date = value.toDate();
    else if (value.seconds) date = new Date(value.seconds * 1000);
    else if (value._d) date = value._d;
    else date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return '—';
  }
}

const STATE_LABELS = {
  iniciada: { label: 'Iniciada', color: 'bg-turquoise-50 text-turquoise-700' },
  initiate: { label: 'Iniciada', color: 'bg-turquoise-50 text-turquoise-700' },
  asignada: { label: 'Asignada', color: 'bg-turquoise-100 text-turquoise-800' },
  process: { label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  proceso: { label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  en_espera: { label: 'En espera', color: 'bg-stone-100 text-stone-600' },
  espera: { label: 'En espera', color: 'bg-stone-100 text-stone-600' },
  done: { label: 'Finalizada', color: 'badge-resolved' },
  finalizada: { label: 'Finalizada', color: 'badge-resolved' },
  cancelada: { label: 'Cancelada', color: 'bg-stone-100 text-stone-500' },
};

function StateBadge({ state, done }) {
  if (done && !state) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium badge-resolved">
        <CheckCircle className="w-3 h-3" />
        Cerrada
      </span>
    );
  }
  const s = STATE_LABELS[state] || { label: state || (done ? 'Cerrada' : 'Abierta'), color: done ? 'badge-resolved' : 'bg-amber-50 text-amber-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

const SLA_BADGE_CLASS = {
  ok: 'badge-resolved',
  at_risk: 'badge-medium',
  breached: 'badge-high',
};

function SlaBadge({ doc }) {
  const info = getIncidenceSlaStatus(doc);
  if (!info) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SLA_BADGE_CLASS[info.status] || ''}`} title={info.label}>
      {info.label}
    </span>
  );
}

const STALE_BADGE_CLASS = 'badge-high';

function StaleBadge({ doc }) {
  const info = getIncidenceStaleInfo(doc);
  if (!info || !info.isStale) return null;
  const label = info.daysWithoutChange === 1
    ? '1 día sin cambio'
    : `${info.daysWithoutChange} días sin cambio`;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STALE_BADGE_CLASS}`} title={label}>
      <Hourglass className="w-3 h-3" />
      {label}
    </span>
  );
}

function PhotoGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null);
  const [showAll, setShowAll] = useState(false);

  if (!photos || photos.length === 0) return null;

  const visible = showAll ? photos : photos.slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {visible.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(url)}
            className="aspect-square rounded-xl overflow-hidden bg-stone-100 hover:opacity-90 transition-opacity border border-stone-200/50"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {photos.length > 6 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-turquoise-600 font-medium mt-1 hover:underline"
        >
          Ver {photos.length - 6} más...
        </button>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function WorkerAvatar({ worker }) {
  const [imgErr, setImgErr] = useState(false);
  const name = `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'Sin nombre';
  const rawPhoto = typeof worker.profileImage === 'object'
    ? worker.profileImage?.small || worker.profileImage?.original
    : worker.profileImage;
  const photo = getSafeImageUrl(rawPhoto);

  const content = (
    <>
      {photo && !imgErr ? (
        <img
          src={photo}
          alt=""
          className="w-7 h-7 rounded-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="w-7 h-7 rounded-xl bg-turquoise-500 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {name.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <span className="text-sm text-gray-700">{name}</span>
    </>
  );

  if (worker.id) {
    return (
      <Link
        to={`/trabajadores/${worker.id}`}
        className="flex items-center gap-2 hover:bg-stone-50 rounded-xl px-1 -mx-1 py-0.5 transition-colors"
      >
        {content}
      </Link>
    );
  }
  return <div className="flex items-center gap-2">{content}</div>;
}

const INCIDENCE_STATE_OPTIONS = [
  { value: 'iniciada', label: 'Iniciada' },
  { value: 'asignada', label: 'Asignada' },
  { value: 'process', label: 'En proceso' },
  { value: 'en_espera', label: 'En espera' },
  { value: 'done', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
];

function IncidenceDetailPanel({ incidence, onClose, onIncidenceUpdated, onIncidenceDeleted, allOpenIncidences = [], allWorkers = [], allHouses = [] }) {
  const { user, userData } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHouseId, setEditHouseId] = useState('');
  const [editState, setEditState] = useState('iniciada');
  const [editWorkerIds, setEditWorkerIds] = useState(new Set());
  const [editError, setEditError] = useState(null);
  const updateIncidence = useUpdateIncidence();
  const deleteIncidence = useDeleteIncidence();
  const addActivity = useAddActivity();
  const houseName = incidence.house?.houseName || incidence.house?.[0]?.houseName || 'Sin casa';
  const reporter = incidence.user;
  const reporterName = reporter
    ? `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim()
    : null;
  const workers = incidence.workers || [];
  const photos = incidence.photos || [];
  const currentHouseId = incidence.houseId || incidence.house?.id || incidence.house?.[0]?.id || '';

  useEffect(() => {
    setEditTitle(incidence.title || '');
    setEditDescription(incidence.incidence || incidence.description || '');
    setEditHouseId(currentHouseId);
    setEditState(incidence.state || (incidence.done ? 'done' : 'iniciada'));
    setEditWorkerIds(new Set((incidence.workersId || []).filter(Boolean)));
    setEditError(null);
    setIsEditing(false);
  }, [incidence, currentHouseId]);

  const suggestedWorker = useMemo(() => {
    if (!allWorkers.length || !allOpenIncidences.length) return null;
    const countByWorker = {};
    allWorkers.forEach((w) => { countByWorker[w.id] = 0; });
    allOpenIncidences.forEach((inc) => {
      (inc.workersId || []).forEach((wid) => {
        if (countByWorker[wid] != null) countByWorker[wid] += 1;
      });
    });
    const sorted = allWorkers
      .filter((w) => w.id)
      .sort((a, b) => (countByWorker[a.id] ?? 0) - (countByWorker[b.id] ?? 0));
    return sorted[0] || null;
  }, [allWorkers, allOpenIncidences]);

  const handleStateChange = async (e) => {
    const toState = e.target.value;
    if (!toState || toState === (incidence.state || '')) return;
    const fromState = incidence.state;
    const fromDone = incidence.done;
    const toDone = toState === 'done' || toState === 'finalizada';
    const userPayload = user && userData
      ? { uid: user.uid, firstName: userData.firstName, lastName: userData.lastName }
      : null;
    try {
      await updateIncidence.mutateAsync({
        id: incidence.id,
        state: toState,
        done: toDone,
      });
      await addActivity.mutateAsync({
        collectionName: 'incidences',
        docId: incidence.id,
        type: 'state_change',
        fromState,
        toState,
        fromDone,
        toDone,
        user: userPayload,
      });
      onIncidenceUpdated?.({ ...incidence, state: toState, done: toDone });
    } catch (err) {
      console.error('Error al actualizar estado', err);
    }
  };

  const handleToggleWorker = (workerId) => {
    setEditWorkerIds((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) next.delete(workerId);
      else next.add(workerId);
      return next;
    });
  };

  const handleStartEdit = () => {
    setEditTitle(incidence.title || '');
    setEditDescription(incidence.incidence || incidence.description || '');
    setEditHouseId(currentHouseId);
    setEditState(incidence.state || (incidence.done ? 'done' : 'iniciada'));
    setEditWorkerIds(new Set((incidence.workersId || []).filter(Boolean)));
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setEditError('El título es obligatorio.');
      return;
    }
    if (!editHouseId) {
      setEditError('Selecciona una casa para guardar.');
      return;
    }
    setEditError(null);
    const selectedHouse = allHouses.find((h) => h.id === editHouseId) || null;
    const selectedWorkers = allWorkers.filter((w) => editWorkerIds.has(w.id));
    const toDone = editState === 'done' || editState === 'finalizada' || editState === 'cancelada';
    const normalizedWorkers = selectedWorkers.map((w) => ({
      id: w.id,
      firstName: w.firstName || '',
      lastName: w.lastName || '',
      email: w.email || '',
      role: w.role || '',
      profileImage: w.profileImage || null,
    }));
    try {
      await updateIncidence.mutateAsync({
        id: incidence.id,
        title: editTitle.trim(),
        incidence: editDescription.trim() || null,
        description: editDescription.trim() || null,
        houseId: editHouseId,
        house: selectedHouse,
        state: editState,
        done: toDone,
        workersId: normalizedWorkers.map((w) => w.id),
        workers: normalizedWorkers,
      });
      await addActivity.mutateAsync({
        collectionName: 'incidences',
        docId: incidence.id,
        type: 'incidence_edit',
        user: user && userData
          ? { uid: user.uid, firstName: userData.firstName, lastName: userData.lastName }
          : null,
      });
      onIncidenceUpdated?.({
        ...incidence,
        title: editTitle.trim(),
        incidence: editDescription.trim() || null,
        description: editDescription.trim() || null,
        houseId: editHouseId,
        house: selectedHouse,
        state: editState,
        done: toDone,
        workersId: normalizedWorkers.map((w) => w.id),
        workers: normalizedWorkers,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar incidencia', err);
      setEditError('No se pudo guardar la incidencia. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                incidence.done
                  ? 'bg-turquoise-50 text-turquoise-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {incidence.done ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-stone-900">Incidencia</h2>
          </div>
          <div className="flex items-center gap-1">
            {!confirmDelete && !isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="p-2 rounded-xl hover:bg-turquoise-50 text-stone-500 hover:text-turquoise-700 transition-colors"
                title="Editar"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {!confirmDelete && !isEditing && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {confirmDelete && (
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-amber-900">¿Eliminar esta incidencia? Se borrará de forma permanente. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleteIncidence.isPending}>Cancelar</Button>
              <Button
                onClick={async () => {
                  try {
                    await deleteIncidence.mutateAsync(incidence.id);
                    setConfirmDelete(false);
                    onClose();
                    onIncidenceDeleted?.(incidence.id);
                  } catch (err) {
                    console.error('Error al eliminar incidencia', err);
                  }
                }}
                disabled={deleteIncidence.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteIncidence.isPending ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Eliminando...</>
                ) : (
                  <><Trash2 className="w-4 h-4 mr-1.5" /> Eliminar</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-100 space-y-4">
            {!isEditing ? (
              <>
                {/* Título */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {incidence.title || 'Sin título'}
                </h3>

                {/* Estado */}
                <div className="flex flex-wrap items-center gap-2">
                  <StateBadge state={incidence.state} done={incidence.done} />
                  <SlaBadge doc={incidence} />
                  <StaleBadge doc={incidence} />
                  {!incidence.done && (
                    <select
                      value={incidence.state || 'iniciada'}
                      onChange={handleStateChange}
                      disabled={updateIncidence.isPending}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-turquoise-500 bg-white"
                    >
                      {INCIDENCE_STATE_OPTIONS.filter((o) => o.value !== 'done' || true).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Casa */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4 text-gray-400" />
                  {(incidence.houseId || incidence.house?.id || incidence.house?.[0]?.id) ? (
                    <Link
                      to={`/casas/${incidence.houseId || incidence.house?.id || incidence.house?.[0]?.id}`}
                      className="text-turquoise-600 hover:underline"
                    >
                      {houseName}
                    </Link>
                  ) : (
                    <span>{houseName}</span>
                  )}
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(incidence.date || incidence.createdAt)}</span>
                </div>

                {/* Descripción */}
                {incidence.incidence && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Descripción</p>
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {incidence.incidence}
                    </div>
                  </div>
                )}
                {incidence.description && !incidence.incidence && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Descripción</p>
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {incidence.description}
                    </div>
                  </div>
                )}

                {/* Reportado por */}
                {reporterName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Reportado por</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-700">{reporterName}</span>
                      {reporter?.role && (
                        <span className="text-xs text-gray-400">({reporter.role})</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Trabajadores asignados */}
                {workers.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Trabajadores asignados</p>
                    <div className="space-y-2">
                      {workers.map((w, i) => (
                        <WorkerAvatar key={w.id || i} worker={w} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugerencia de asignación (por carga: menos incidencias abiertas) */}
                {!incidence.done && suggestedWorker && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Sugerir trabajador (menor carga)</p>
                    <div className="flex items-center gap-2">
                      <WorkerAvatar worker={suggestedWorker} />
                      <span className="text-xs text-gray-500">Pulsa Editar para asignarlo.</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Input
                  label="Título *"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título de la incidencia"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Casa *</label>
                  <select
                    value={editHouseId}
                    onChange={(e) => setEditHouseId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seleccionar casa</option>
                    {allHouses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.houseName || 'Sin nombre'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white"
                  >
                    {INCIDENCE_STATE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trabajadores asignados</label>
                  <div className="max-h-44 overflow-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {allWorkers.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">No hay trabajadores disponibles.</p>
                    ) : (
                      allWorkers.map((w) => {
                        const label = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.email || 'Trabajador';
                        return (
                          <label key={w.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editWorkerIds.has(w.id)}
                              onChange={() => handleToggleWorker(w.id)}
                              className="rounded border-gray-300 text-turquoise-600 focus:ring-turquoise-500"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                {editError && <p className="text-sm text-red-600">{editError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { setIsEditing(false); setEditError(null); }}
                    disabled={updateIncidence.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updateIncidence.isPending}
                  >
                    {updateIncidence.isPending ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Fotos */}
          {photos.length > 0 && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Fotos ({photos.length})
                </p>
              </div>
              <PhotoGallery photos={photos} />
            </div>
          )}

          {/* Historial / Timeline */}
          <div className="px-6 py-4 border-t border-[var(--border-soft)]">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Historial</h3>
            <Timeline
              collectionName="incidences"
              docId={incidence.id}
              showCommentForm
              emptyMessage="Sin comentarios ni cambios de estado aún."
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export default function IncidencesPage() {
  const [filterDone, setFilterDone] = useState(undefined);
  const [filterSlaRisk, setFilterSlaRisk] = useState(false);
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [filterStale, setFilterStale] = useState(false);
  const [filterHouseId, setFilterHouseId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: incidences = [], isLoading } = useIncidences({
    ...(filterDone !== undefined && { done: filterDone }),
  });
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const { data: houses = [] } = useHouses();
  const { data: allWorkers = [] } = useWorkersFirestore();
  const openIncidencesForSuggestion = useMemo(
    () => incidences.filter((inc) => !inc.done),
    [incidences]
  );

  const filteredIncidences = useMemo(() => {
    let list = incidences;
    if (filterSlaRisk) {
      list = list.filter((inc) => {
        const sla = getIncidenceSlaStatus(inc);
        return sla && (sla.status === 'at_risk' || sla.status === 'breached');
      });
    }
    if (filterUnassigned) {
      list = list.filter((inc) => {
        const hasWorkers = (inc.workersId && inc.workersId.length > 0) || (inc.workers && inc.workers.length > 0);
        return !hasWorkers;
      });
    }
    if (filterStale) {
      list = list.filter((inc) => getIncidenceStaleInfo(inc)?.isStale === true);
    }
    if (filterHouseId) {
      list = list.filter((inc) => {
        const hid = inc.houseId || inc.house?.id || inc.house?.[0]?.id;
        return hid === filterHouseId;
      });
    }
    return list;
  }, [incidences, filterSlaRisk, filterUnassigned, filterStale, filterHouseId]);

  const hasQuickFilters = filterSlaRisk || filterUnassigned || filterStale || !!filterHouseId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-gray-500">
            Incidencias reportadas por trabajadores o administradores
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva incidencia
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterDone === undefined ? 'primary' : 'outline'}
          onClick={() => setFilterDone(undefined)}
        >
          Todas
        </Button>
        <Button
          variant={filterDone === false ? 'primary' : 'outline'}
          onClick={() => setFilterDone(false)}
        >
          Abiertas
        </Button>
        <Button
          variant={filterDone === true ? 'primary' : 'outline'}
          onClick={() => setFilterDone(true)}
        >
          Cerradas
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Filtros rápidos:</span>
        <Button
          variant={filterSlaRisk ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterSlaRisk((v) => !v)}
          title="Solo incidencias con plazo en riesgo o fuera de plazo"
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Plazo en riesgo
        </Button>
        <Button
          variant={filterUnassigned ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterUnassigned((v) => !v)}
          title="Solo incidencias sin trabajador asignado"
        >
          <UserX className="w-4 h-4 mr-1" />
          Sin asignar
        </Button>
        <Button
          variant={filterStale ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterStale((v) => !v)}
          title="Solo incidencias estancadas (sin cambio de estado)"
        >
          <Hourglass className="w-4 h-4 mr-1" />
          Estancadas
        </Button>
        <select
          value={filterHouseId}
          onChange={(e) => setFilterHouseId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white min-w-[180px]"
          title="Filtrar por propiedad"
        >
          <option value="">Por casa (todas)</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.houseName || 'Sin nombre'}
            </option>
          ))}
        </select>
        {hasQuickFilters && (
          <button
            type="button"
            onClick={() => {
              setFilterSlaRisk(false);
              setFilterUnassigned(false);
              setFilterStale(false);
              setFilterHouseId('');
            }}
            className="text-sm text-turquoise-600 hover:underline"
          >
            Quitar filtros rápidos
          </button>
        )}
      </div>

      {!isLoading && filteredIncidences.length > 0 && (
        <p className="text-sm text-gray-500">
          {filteredIncidences.length} incidencia{filteredIncidences.length !== 1 ? 's' : ''}
          {hasQuickFilters && incidences.length !== filteredIncidences.length && (
            <span> (de {incidences.length})</span>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : filteredIncidences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-turquoise-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-turquoise-500" />
          </div>
          <p className="font-heading text-gray-800 font-medium mb-1">
            {hasQuickFilters ? 'Ninguna incidencia con estos filtros' : 'No hay incidencias'}
          </p>
          <p className="text-sm text-gray-500">
            {hasQuickFilters
              ? 'Prueba a quitar filtros rápidos o cambiar criterios'
              : 'Las incidencias aparecerán aquí cuando se creen'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidences.map((inc) => (
            <Card
              key={inc.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedIncidence(inc)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    inc.done
                      ? 'bg-turquoise-50 text-turquoise-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {inc.done ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 line-clamp-1 flex-1">
                      {inc.title || inc.description?.slice(0, 60) || 'Sin título'}
                    </p>
                    {inc.photos?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                        <Camera className="w-3 h-3" />
                        {inc.photos.length}
                      </span>
                    )}
                  </div>
                  {(inc.incidence || inc.description) && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                      {inc.incidence || inc.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                    {(inc.houseId || inc.house?.id || inc.house?.[0]?.id) && (
                      <Link
                        to={`/casas/${inc.houseId || inc.house?.id || inc.house?.[0]?.id}`}
                        className="flex items-center gap-1 text-turquoise-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Home className="w-3 h-3" />
                        {inc.house?.houseName || inc.house?.[0]?.houseName || 'Casa'}
                      </Link>
                    )}
                    {(inc.createdAt || inc.date) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(inc.date || inc.createdAt)}
                      </span>
                    )}
                    <StateBadge state={inc.state} done={inc.done} />
                    <SlaBadge doc={inc} />
                    <StaleBadge doc={inc} />
                    {(inc.workers || []).map((w, i) => (
                      <Link
                        key={w.id || i}
                        to={w.id ? `/trabajadores/${w.id}` : '#'}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${w.id ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-3 h-3" />
                        {`${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Trabajador'}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedIncidence && (
        <IncidenceDetailPanel
          incidence={selectedIncidence}
          onClose={() => setSelectedIncidence(null)}
          onIncidenceUpdated={(updated) => setSelectedIncidence(updated)}
          onIncidenceDeleted={() => setSelectedIncidence(null)}
          allOpenIncidences={openIncidencesForSuggestion}
          allWorkers={allWorkers}
          allHouses={houses}
        />
      )}

      {showCreateModal && (
        <CreateIncidenceModal
          houses={houses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function CreateIncidenceModal({ houses, onClose, onCreated }) {
  const createIncidence = useCreateIncidence();
  const { user, userData } = useAuth();
  const { data: settings } = useSettings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [houseId, setHouseId] = useState('');

  const house = houses.find((h) => h.id === houseId);
  const canSubmit = title.trim() && houseId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createIncidence.mutateAsync({
        title: title.trim(),
        incidence: description.trim() || undefined,
        houseId: house.id,
        house: house,
        createdBy: user && userData ? { uid: user.uid, email: userData.email || '' } : undefined,
        slaResponseHours: settings?.slaIncidenceResponseHours ?? 24,
        slaResolutionHours: settings?.slaIncidenceResolutionHours ?? 72,
      });
      onCreated();
    } catch (err) {
      console.error('Error creating incidence', err);
    }
  };

  return (
    <Modal open onClose={onClose} title="Nueva incidencia">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Título *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fuga de agua en baño"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles de la incidencia..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad *</label>
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
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
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit || createIncidence.isPending}>
            {createIncidence.isPending ? 'Creando…' : 'Crear incidencia'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
