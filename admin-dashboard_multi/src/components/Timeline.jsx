import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, RotateCw, User } from 'lucide-react';
import { useMessages, useActivity, useAddMessage } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';

function formatTimelineDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') date = value.toDate();
    else if (value?.seconds != null) date = new Date(value.seconds * 1000);
    else if (value instanceof Date) date = value;
    else date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? format(date, "HH:mm", { locale: es })
      : format(date, "d MMM HH:mm", { locale: es });
  } catch {
    return '—';
  }
}

function getUserDisplay(item) {
  const u = item.user;
  if (!u) return 'Sistema';
  if (u.firstName != null || u.lastName != null) {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Usuario';
  }
  return u.name || u.email || 'Usuario';
}

/**
 * Convierte mensajes y actividad a un array unificado ordenado por createdAt.
 */
function mergeTimelineItems(messages = [], activity = []) {
  const toTs = (item) => {
    const c = item.createdAt;
    if (!c) return 0;
    if (c.toMillis) return c.toMillis();
    if (c?.seconds != null) return c.seconds * 1000;
    return new Date(c).getTime();
  };

  const messagesNorm = messages.map((m) => ({ ...m, _type: 'message', _sort: toTs(m) }));
  const activityNorm = activity.map((a) => ({ ...a, _type: 'activity', _sort: toTs(a) }));
  return [...messagesNorm, ...activityNorm].sort((a, b) => a._sort - b._sort);
}

const STATE_LABELS = {
  iniciada: 'Iniciada',
  initiate: 'Iniciada',
  asignada: 'Asignada',
  process: 'En proceso',
  proceso: 'En proceso',
  en_espera: 'En espera',
  espera: 'En espera',
  done: 'Finalizada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

function TimelineItem({ item }) {
  if (item._type === 'message') {
    const text = item.text || item.message || '';
    if (!text && !item.image) return null;
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-turquoise-50 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-turquoise-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {getUserDisplay(item)}
            <span className="ml-1">{formatTimelineDate(item.createdAt)}</span>
          </p>
          <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap break-words">{text}</p>
          {item.image && (
            <a
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-xs text-turquoise-600 hover:underline"
            >
              Ver imagen
            </a>
          )}
        </div>
      </div>
    );
  }

  if (item._type === 'activity' && item.type === 'state_change') {
    const fromLabel = item.fromState != null ? (STATE_LABELS[item.fromState] || item.fromState) : (item.fromDone ? 'Cerrada' : 'Abierta');
    const toLabel = item.toState != null ? (STATE_LABELS[item.toState] || item.toState) : (item.toDone ? 'Cerrada' : 'Abierta');
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <RotateCw className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {getUserDisplay(item)}
            <span className="ml-1">{formatTimelineDate(item.createdAt)}</span>
          </p>
          <p className="text-sm text-gray-700 mt-0.5">
            Cambio de estado: <span className="text-gray-500">{fromLabel}</span>
            {' → '}
            <span className="font-medium text-turquoise-600">{toLabel}</span>
          </p>
        </div>
      </div>
    );
  }

  if (item._type === 'activity' && item.type === 'status_change') {
    const toLabel = STATE_LABELS[item.toStatus] || item.toStatus || (item.finished ? 'Finalizada' : 'En curso');
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <RotateCw className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {getUserDisplay(item)}
            <span className="ml-1">{formatTimelineDate(item.createdAt)}</span>
          </p>
          <p className="text-sm text-gray-700 mt-0.5">
            Estado: <span className="font-medium text-turquoise-600">{toLabel}</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function Timeline({ collectionName, docId, showCommentForm = true, emptyMessage = 'Sin comentarios ni cambios aún.' }) {
  const { user, userData } = useAuth();
  const { data: messages = [], isLoading: loadingMessages } = useMessages(collectionName, docId);
  const { data: activity = [], isLoading: loadingActivity } = useActivity(collectionName, docId);
  const addMessage = useAddMessage();

  const timeline = useMemo(
    () => mergeTimelineItems(messages, activity),
    [messages, activity]
  );

  const isLoading = loadingMessages || loadingActivity;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const form = e.target;
    const text = form.comment?.value?.trim();
    if (!text || !docId || !collectionName) return;
    const userPayload = user && userData
      ? { uid: user.uid, firstName: userData.firstName, lastName: userData.lastName }
      : null;
    addMessage.mutate(
      { collectionName, docId, text, user: userPayload },
      {
        onSuccess: () => { form.comment.value = ''; },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        Cargando historial...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            name="comment"
            type="text"
            placeholder="Añadir comentario..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            disabled={addMessage.isPending}
          />
          <button
            type="submit"
            disabled={addMessage.isPending || !user}
            className="px-4 py-2 rounded-lg bg-turquoise-500 text-white text-sm font-medium hover:bg-turquoise-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addMessage.isPending ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {timeline.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        ) : (
          timeline.map((item) => (
            <TimelineItem key={`${item._type}-${item.id}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

export { mergeTimelineItems, formatTimelineDate, getUserDisplay, STATE_LABELS };
