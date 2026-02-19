import { useState } from 'react';
import { useEntrances } from '@/hooks/useFirestore';
import {
  X,
  Clock,
  CheckCircle,
  MapPin,
  Camera,
  User,
  Calendar,
  LogIn,
  LogOut,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function PhotoCard({ label, icon: Icon, photo, time, location }) {
  const [lightbox, setLightbox] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4" />
          {label}
        </div>

        {time && (
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{time}</p>
        )}

        {photo && !imgError ? (
          <div
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setLightbox(true)}
          >
            <img
              src={photo}
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Ver
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Camera className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">Sin foto</p>
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {lightbox && photo && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={photo}
            alt={label}
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default function ShiftDetailPanel({ shift, onClose }) {
  const entranceIds = shift?.entranceIds || [];
  const { data: entrances = [], isLoading: loadingEntrances } = useEntrances(entranceIds);

  const entryDate = toDate(shift.firstEntry);
  const exitDate = toDate(shift.lastExit);

  const entryPhotos = entrances
    .map((e) => ({
      photo: e.images?.[0]?.url || e.photos?.[0] || null,
      location: e.location || null,
      time: toDate(e.date),
    }))
    .filter((e) => e.photo || e.time);

  const exitPhotos = entrances
    .filter((e) => e.exitDate)
    .map((e) => ({
      photo: e.images?.[1]?.url || e.photos?.[1] || null,
      location: e.exitLocation || null,
      time: toDate(e.exitDate),
    }))
    .filter((e) => e.photo || e.time);

  const bestEntry = entryPhotos[0] || {};
  const bestExit = exitPhotos[exitPhotos.length - 1] || {};

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Detalle de jornada
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Worker info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {shift.workerPhoto ? (
                <img
                  src={shift.workerPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg sm:text-xl font-semibold text-white">
                  {shift.workerName?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {shift.workerName || 'Sin nombre'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    shift.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {shift.status === 'completed' ? (
                    <><CheckCircle className="w-3 h-3" />Completada</>
                  ) : (
                    <><Clock className="w-3 h-3" />En curso</>
                  )}
                </span>
                {shift.isManual && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Manual</span>
                )}
              </div>
            </div>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Fecha
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {entryDate
                  ? format(entryDate, "d MMM yyyy", { locale: es })
                  : shift.date || '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Duración
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {shift.totalMinutes > 0
                  ? `${Math.floor(shift.totalMinutes / 60)}h ${shift.totalMinutes % 60}m`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Loading entrances */}
          {loadingEntrances && entranceIds.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-400">
              Cargando fotos...
            </div>
          )}

          {/* Entry */}
          <PhotoCard
            label="Entrada"
            icon={LogIn}
            photo={bestEntry.photo}
            time={entryDate ? format(entryDate, 'HH:mm') : null}
            location={bestEntry.location}
          />

          {/* Exit */}
          <PhotoCard
            label="Salida"
            icon={LogOut}
            photo={bestExit.photo}
            time={exitDate ? format(exitDate, 'HH:mm') : null}
            location={bestExit.location}
          />

          {/* Extra entrances */}
          {entrances.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Todos los registros ({entrances.length})
              </h3>
              <div className="space-y-2">
                {entrances.map((ent, i) => {
                  const eDate = toDate(ent.date);
                  const eExit = toDate(ent.exitDate);
                  const ePhoto = ent.images?.[0]?.url || ent.photos?.[0];
                  const exPhoto = ent.images?.[1]?.url || ent.photos?.[1];
                  return (
                    <div key={ent.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                      <div className="flex-shrink-0 text-xs font-bold text-gray-400 w-5 text-center">
                        {i + 1}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {ePhoto ? (
                          <img src={ePhoto} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <LogIn className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                        {exPhoto ? (
                          <img src={exPhoto} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <LogOut className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">
                          {eDate ? format(eDate, 'HH:mm') : '—'}
                          {' → '}
                          {eExit ? format(eExit, 'HH:mm') : '...'}
                        </p>
                        {ent.location && (
                          <p className="text-[10px] text-gray-400 truncate">
                            <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                            {ent.location.latitude?.toFixed(4)}, {ent.location.longitude?.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {shift.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-1">
                <FileText className="w-3.5 h-3.5" />
                Notas
              </div>
              <p className="text-sm text-amber-800">{shift.notes}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
