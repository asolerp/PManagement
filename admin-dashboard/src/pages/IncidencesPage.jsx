import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useIncidences } from '@/hooks/useFirestore';
import {
  AlertCircle,
  CheckCircle,
  X,
  Home,
  Calendar,
  User,
  Camera,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';

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
  iniciada: { label: 'Iniciada', color: 'bg-blue-50 text-blue-700' },
  initiate: { label: 'Iniciada', color: 'bg-blue-50 text-blue-700' },
  process: { label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  proceso: { label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  done: { label: 'Finalizada', color: 'bg-emerald-50 text-emerald-700' },
  finalizada: { label: 'Finalizada', color: 'bg-emerald-50 text-emerald-700' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
};

function StateBadge({ state, done }) {
  if (done && !state) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <CheckCircle className="w-3 h-3" />
        Cerrada
      </span>
    );
  }
  const s = STATE_LABELS[state] || { label: state || (done ? 'Cerrada' : 'Abierta'), color: done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
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
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {photos.length > 6 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-[#126D9B] font-medium mt-1 hover:underline"
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
  const name = `${worker.firstName || ''} ${worker.lastName || ''}`.trim();
  const photo = typeof worker.profileImage === 'object'
    ? worker.profileImage?.small || worker.profileImage?.original
    : worker.profileImage;

  return (
    <div className="flex items-center gap-2">
      {photo && !imgErr ? (
        <img
          src={photo}
          alt=""
          className="w-7 h-7 rounded-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {name.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <span className="text-sm text-gray-700">{name || 'Sin nombre'}</span>
    </div>
  );
}

function IncidenceDetailPanel({ incidence, onClose }) {
  const houseName = incidence.house?.houseName || incidence.house?.[0]?.houseName || 'Sin casa';
  const reporter = incidence.user;
  const reporterName = reporter
    ? `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim()
    : null;
  const workers = incidence.workers || [];
  const photos = incidence.photos || [];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                incidence.done
                  ? 'bg-[#67B26F]/10 text-[#67B26F]'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {incidence.done ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Incidencia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-100 space-y-4">
            {/* Título */}
            <h3 className="text-lg font-semibold text-gray-900">
              {incidence.title || 'Sin título'}
            </h3>

            {/* Estado */}
            <StateBadge state={incidence.state} done={incidence.done} />

            {/* Casa */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4 text-gray-400" />
              <span>{houseName}</span>
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
        </div>
      </aside>
    </>
  );
}

export default function IncidencesPage() {
  const [filterDone, setFilterDone] = useState(undefined);
  const { data: incidences = [], isLoading } = useIncidences({
    ...(filterDone !== undefined && { done: filterDone }),
  });
  const [selectedIncidence, setSelectedIncidence] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
        <p className="text-gray-500">
          Incidencias reportadas por trabajadores o administradores
        </p>
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

      {!isLoading && incidences.length > 0 && (
        <p className="text-sm text-gray-500">
          {incidences.length} incidencia{incidences.length !== 1 ? 's' : ''}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : incidences.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay incidencias
        </div>
      ) : (
        <div className="space-y-3">
          {incidences.map((inc) => (
            <Card
              key={inc.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedIncidence(inc)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    inc.done
                      ? 'bg-[#67B26F]/10 text-[#67B26F]'
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
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {inc.house && (
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {inc.house?.houseName || inc.house?.[0]?.houseName || ''}
                      </span>
                    )}
                    {(inc.createdAt || inc.date) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(inc.date || inc.createdAt)}
                      </span>
                    )}
                    <StateBadge state={inc.state} done={inc.done} />
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
        />
      )}
    </div>
  );
}
