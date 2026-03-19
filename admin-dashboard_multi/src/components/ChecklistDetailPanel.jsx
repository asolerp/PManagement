import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChecks, useSendChecklistEmail, useDeleteChecklist, useUpdateCheck } from '@/hooks/useFirestore';
import {
  CheckSquare,
  CheckCircle,
  X,
  Camera,
  User,
  Calendar,
  Home,
  FileText,
  Mail,
  Send,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Timeline from '@/components/Timeline';

function formatChecklistDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') date = value.toDate();
    else if (value.seconds) date = new Date(value.seconds * 1000);
    else if (value._d) date = value._d;
    else date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM yyyy", { locale: es });
  } catch {
    return '—';
  }
}

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.min((done / total) * 100, 100) : 0;
  const isComplete = done >= total && total > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500">Progreso</span>
        <span className={`font-semibold ${isComplete ? 'text-[#67B26F]' : 'text-[#126D9B]'}`}>
          {done || 0}/{total || 0}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isComplete ? 'bg-[#67B26F]' : 'bg-[#126D9B]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PhotoGallery({ photos }) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  if (!photos || photos.length === 0) return null;

  const visiblePhotos = expanded ? photos : photos.slice(0, 3);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {visiblePhotos.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(url)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {photos.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-[#126D9B] font-medium mt-1 hover:underline"
        >
          Ver {photos.length - 3} más...
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

function CheckItem({ check, onToggle, disabled }) {
  const locale = navigator.language?.split('-')[0] || 'es';
  const title = check.locale?.[locale] || check.locale?.es || check.locale?.en || 'Check';
  const isDone = check.done;
  const hasPhotos = check.photos?.length > 0;
  const workerName = check.worker
    ? `${check.worker.firstName || ''} ${check.worker.lastName || ''}`.trim()
    : null;
  const canToggle = onToggle && !disabled;

  return (
    <div className="border-b border-gray-100 last:border-b-0 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => canToggle && onToggle(check)}
          disabled={!canToggle}
          className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-colors ${
            isDone
              ? 'bg-[#55A5AD] border-[#55A5AD]'
              : 'border-gray-300 bg-white'
          } ${canToggle ? 'cursor-pointer hover:border-[#55A5AD]/70 hover:bg-[#55A5AD]/10' : 'cursor-default'}`}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {title}
          </p>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {isDone && check.date && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                {formatChecklistDate(check.date)}
              </span>
            )}
            {workerName && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {workerName}
              </span>
            )}
            {hasPhotos && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Camera className="w-3 h-3" />
                {check.photos.length}
              </span>
            )}
          </div>

          <PhotoGallery photos={check.photos} />
        </div>
      </div>
    </div>
  );
}

export default function ChecklistDetailPanel({ checklist, onClose }) {
  const { data: checks = [], isLoading: loadingChecks } = useChecks(checklist.id);
  const sendEmail = useSendChecklistEmail();
  const deleteChecklist = useDeleteChecklist();
  const updateCheck = useUpdateCheck();
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingCheckId, setTogglingCheckId] = useState(null);

  const handleToggleCheck = async (check) => {
    if (check.done === undefined) return;
    const newDone = !check.done;
    setTogglingCheckId(check.id);
    try {
      await updateCheck.mutateAsync({
        checklistId: checklist.id,
        checkId: check.id,
        check,
        done: newDone,
      });
    } catch (e) {
      console.error('Error al actualizar el punto', e);
    } finally {
      setTogglingCheckId(null);
    }
  };

  const houseName = checklist.house?.[0]?.houseName || checklist.houseName || 'Sin casa';
  const doneCount = checks.filter((c) => c.done).length;
  const totalCount = checks.length;
  const workers = checklist.workers || [];
  const isSent = checklist.send === true || emailSuccess;
  const sentTo = checklist.sendTo;
  const sentAt = checklist.sendAt;

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      await sendEmail.mutateAsync(checklist.id);
      setEmailSuccess(true);
    } catch (e) {
      console.error('Error sending email', e);
    } finally {
      setEmailSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteChecklist.mutateAsync(checklist.id);
      onClose();
    } catch (e) {
      console.error('Error deleting checklist', e);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                checklist.finished
                  ? 'bg-turquoise-50 text-turquoise-600'
                  : 'bg-turquoise-50 text-turquoise-600'
              }`}
            >
              {checklist.finished ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <CheckSquare className="w-5 h-5" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-stone-900">Revisión</h2>
          </div>
          <div className="flex items-center gap-1">
            {!confirmDelete && (
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
            <p className="text-sm text-amber-900">¿Eliminar esta revisión? Se eliminarán todos sus puntos. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" onClick={() => { setConfirmDelete(false); setDeleting(false); }} disabled={deleting}>Cancelar</Button>
              <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                {deleting ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Eliminando...</> : <><Trash2 className="w-4 h-4 mr-1.5" /> Eliminar</>}
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Home className="w-4 h-4 text-gray-400" />
              {(checklist.houseId || checklist.house?.[0]?.id || checklist.house?.id) ? (
                <Link
                  to={`/casas/${checklist.houseId || checklist.house?.[0]?.id || checklist.house?.id}`}
                  className="font-semibold text-[#126D9B] hover:underline"
                >
                  {houseName}
                </Link>
              ) : (
                <span className="font-semibold">{houseName}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatChecklistDate(checklist.date)}</span>
            </div>

            {checklist.finished && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#67B26F]/10 text-[#67B26F]">
                Finalizado
              </span>
            )}

            <ProgressBar done={doneCount} total={totalCount} />

            {workers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Trabajadores asignados</p>
                <div className="flex flex-wrap gap-2">
                  {workers.map((w, i) => {
                    const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || 'Trabajador';
                    const content = (
                      <>
                        <User className="w-3 h-3" />
                        {name}
                      </>
                    );
                    return w.id ? (
                      <Link
                        key={w.id || i}
                        to={`/trabajadores/${w.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {content}
                      </Link>
                    ) : (
                      <span
                        key={w.id || i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {content}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {checklist.observations && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  <FileText className="w-4 h-4 text-gray-400 inline mr-1.5" />
                  {checklist.observations}
                </div>
              </div>
            )}

            {/* Estado de envío al propietario */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Email al propietario
                  </span>
                </div>
                {isSent ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <CheckCircle className="w-3 h-3" />
                    Enviado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                    No enviado
                  </span>
                )}
              </div>

              {isSent && sentTo && (
                <p className="text-xs text-gray-500">
                  Enviado a: {Array.isArray(sentTo) ? sentTo.join(', ') : sentTo}
                  {sentAt && (
                    <> · {formatChecklistDate(sentAt)}</>
                  )}
                </p>
              )}

              <Button
                size="sm"
                variant={isSent ? 'outline' : 'primary'}
                className="w-full"
                loading={emailSending}
                onClick={handleSendEmail}
              >
                {isSent ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                    Reenviar email
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Enviar al propietario
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="px-6 py-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Puntos ({doneCount}/{totalCount})
            </p>

            {loadingChecks ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Cargando puntos...
              </div>
            ) : checks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No hay puntos en esta revisión
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="divide-y divide-gray-100 px-4">
                  {checks.map((check) => (
                    <CheckItem
                      key={check.id}
                      check={check}
                      onToggle={handleToggleCheck}
                      disabled={checklist.finished || togglingCheckId === check.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historial / Comentarios */}
          <div className="px-6 py-4 border-t border-[var(--border-soft)]">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Historial</h3>
            <Timeline
              collectionName="checklists"
              docId={checklist.id}
              showCommentForm
              emptyMessage="Sin comentarios aún."
            />
          </div>
        </div>
      </aside>
    </>
  );
}
