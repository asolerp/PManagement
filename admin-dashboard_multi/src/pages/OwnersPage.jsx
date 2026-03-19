import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import {
  useOwners,
  useHouses,
  useIncidences,
  useJobs,
  useOwnerDocuments,
  useUploadOwnerDocument,
  useDeleteOwnerDocument,
} from '@/hooks/useFirestore';
import {
  Building2,
  X,
  Mail,
  Phone,
  Home,
  ChevronRight,
  AlertCircle,
  Briefcase,
  MessageSquare,
  FileText,
  Upload,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DEFAULT_AVATAR = '/placeholder-avatar.svg';

function OwnerAvatar({ owner, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const photo = owner?.profileImage?.small;
  const photoUrl = getSafeImageUrl(photo);
  const sizeMap = { sm: 'w-12 h-12', md: 'w-14 h-14', lg: 'w-16 h-16' };
  const iconMap = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10' };
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const iconClasses = iconMap[size] || iconMap.md;

  const showDefault = !photoUrl || imgError;

  if (showDefault) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-gray-300 overflow-hidden p-0`}
      >
        <img
          src={DEFAULT_AVATAR}
          alt=""
          className={`${iconClasses} object-contain opacity-90`}
        />
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt=""
      className={`${sizeClasses} rounded-full object-cover flex-shrink-0`}
      onError={() => setImgError(true)}
    />
  );
}

function getIncidenceHouseId(incidence) {
  if (incidence.houseId) return incidence.houseId;
  if (incidence.house?.id) return incidence.house.id;
  if (incidence.house?.[0]?.id) return incidence.house[0].id;
  return null;
}

function getIncidenceHouseName(incidence) {
  return incidence.house?.houseName || incidence.house?.[0]?.houseName || 'Sin propiedad';
}

function toDate(value) {
  if (!value) return null;
  try {
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    return new Date(value);
  } catch {
    return null;
  }
}

const DOC_TYPE_LABELS = {
  invoice: 'Factura',
  contract: 'Contrato',
  report: 'Informe',
  other: 'Otro',
};

export function OwnerDocumentsSection({ ownerId, documents, loading, uploadDoc, deleteDoc }) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploadFile, setUploadFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      await uploadDoc.mutateAsync({
        ownerId,
        file: uploadFile,
        name: uploadName.trim() || uploadFile.name,
        type: uploadType,
      });
      setUploadFile(null);
      setUploadName('');
      setUploadType('other');
      setShowUpload(false);
    } catch (err) {
      console.error('Error subiendo documento', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    setDeletingId(id);
    try {
      await deleteDoc.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Facturación y documentos
      </h4>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : (
        <>
          {documents.length === 0 && !showUpload && (
            <p className="text-sm text-gray-500 mb-2">Sin documentos.</p>
          )}
          <ul className="space-y-2 max-h-48 overflow-y-auto mb-3">
            {documents.map((docItem) => {
              const created = toDate(docItem.createdAt);
              const typeLabel = DOC_TYPE_LABELS[docItem.type] || docItem.type || 'Otro';
              return (
                <li
                  key={docItem.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0">
                    {typeLabel}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={docItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#126D9B] hover:underline truncate block"
                    >
                      {docItem.name || docItem.fileName}
                    </a>
                    {created && (
                      <p className="text-xs text-gray-400">{format(created, 'd MMM yyyy', { locale: es })}</p>
                    )}
                  </div>
                  <a
                    href={docItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                    title="Abrir"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(docItem.id)}
                    disabled={deletingId === docItem.id}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          {!showUpload ? (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="text-sm text-[#126D9B] font-medium hover:underline flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Añadir documento
            </button>
          ) : (
            <form onSubmit={handleUpload} className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#126D9B] file:text-white file:cursor-pointer"
              />
              <input
                type="text"
                placeholder="Nombre (opcional)"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowUpload(false); setUploadFile(null); setUploadName(''); }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploadDoc.isPending}
                  className="text-sm font-medium text-[#126D9B] hover:underline disabled:opacity-50"
                >
                  {uploadDoc.isPending ? 'Subiendo…' : 'Subir'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function OwnerDetailPanel({ owner, houses, onClose }) {
  const { data: incidences = [], isLoading: loadingIncidences } = useIncidences();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();
  const { data: documents = [], isLoading: loadingDocs } = useOwnerDocuments(owner?.id);
  const uploadDoc = useUploadOwnerDocument();
  const deleteDoc = useDeleteOwnerDocument();

  const ownerHouses = houses.filter((h) => h.owner?.id === owner.id);
  const ownerHouseIds = useMemo(() => new Set(ownerHouses.map((h) => h.id)), [ownerHouses]);
  const houseNameById = useMemo(() => Object.fromEntries(ownerHouses.map((h) => [h.id, h.houseName || 'Sin nombre'])), [ownerHouses]);

  const timeline = useMemo(() => {
    const items = [];
    incidences.forEach((inc) => {
      const houseId = getIncidenceHouseId(inc);
      if (!ownerHouseIds.has(houseId)) return;
      const d = toDate(inc.date || inc.createdAt);
      items.push({
        type: 'incidence',
        id: inc.id,
        date: d || new Date(0),
        title: inc.title || 'Incidencia',
        houseName: getIncidenceHouseName(inc),
        done: inc.done,
      });
    });
    jobs.forEach((job) => {
      if (!job.houseId || !ownerHouseIds.has(job.houseId)) return;
      const d = toDate(job.createdAt);
      items.push({
        type: 'job',
        id: job.id,
        date: d || new Date(0),
        title: job.title || job.jobName || 'Trabajo',
        houseName: houseNameById[job.houseId] || 'Sin nombre',
        status: job.status,
      });
    });
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 50);
  }, [incidences, jobs, ownerHouseIds, houseNameById]);

  const displayName = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.email || 'Sin nombre';
  const loadingHistory = loadingIncidences || loadingJobs;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">Propietario</h2>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/propietarios/${owner.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#126D9B] hover:bg-[#126D9B]/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver ficha completa
            </Link>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <OwnerAvatar owner={owner} size="lg" />
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
              {owner.email && (
                <a
                  href={`mailto:${owner.email}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#126D9B] mt-0.5"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </a>
              )}
              {owner.phone && (
                <a
                  href={`tel:${owner.phone}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#126D9B] mt-1"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{owner.phone}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Propiedades ({ownerHouses.length})
            </h4>
            {ownerHouses.length === 0 ? (
              <p className="text-sm text-gray-500">Sin propiedades asignadas.</p>
            ) : (
              <ul className="space-y-2">
                {ownerHouses.map((house) => (
                  <li key={house.id}>
                    <Link
                      to="/casas"
                      state={{}}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#126D9B]/40 hover:bg-[#126D9B]/5 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{house.houseName || 'Sin nombre'}</p>
                        {(house.street || house.municipio) && (
                          <p className="text-xs text-gray-500 truncate">
                            {[house.street, house.municipio].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#126D9B] flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comunicación / historial
            </h4>
            {loadingHistory ? (
              <p className="text-sm text-gray-500">Cargando historial...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-gray-500">Sin incidencias ni trabajos en sus propiedades.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {timeline.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      to={item.type === 'incidence' ? '/incidencias' : '/trabajos'}
                      className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#126D9B]/30 hover:bg-[#126D9B]/5 transition-colors group"
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {item.type === 'incidence' ? (
                          <AlertCircle className={`w-4 h-4 ${item.done ? 'text-emerald-500' : 'text-amber-500'}`} />
                        ) : (
                          <Briefcase className="w-4 h-4 text-[#126D9B]" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#126D9B]">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.houseName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(item.date, "d MMM yyyy", { locale: es })}
                          {item.type === 'incidence' && (
                            <span className={item.done ? ' text-emerald-600' : ' text-amber-600'}>
                              {' · '}{item.done ? 'Cerrada' : 'Abierta'}
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#126D9B] flex-shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <OwnerDocumentsSection
            ownerId={owner.id}
            documents={documents}
            loading={loadingDocs}
            uploadDoc={uploadDoc}
            deleteDoc={deleteDoc}
          />

          <p className="text-xs text-gray-400">
            Para editar datos del propietario usa la sección <Link to="/usuarios" className="text-[#126D9B] hover:underline">Usuarios</Link>.
          </p>
        </div>
      </aside>
    </>
  );
}

export default function OwnersPage() {
  const { data: owners = [], isLoading } = useOwners();
  const { data: houses = [] } = useHouses();
  const [selectedOwner, setSelectedOwner] = useState(null);

  const getPropertyCount = (ownerId) => houses.filter((h) => h.owner?.id === ownerId).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#126D9B] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Propietarios</h1>
        <p className="text-gray-600 mt-1">
          Usuarios con rol propietario. Tienen acceso a su panel para ver sus propiedades y mantenimiento.
        </p>
      </div>

      {owners.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#126D9B]/20 to-[#67B26F]/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#126D9B]" />
          </div>
          <p className="font-heading text-gray-800 font-medium mb-1">No hay propietarios registrados</p>
          <p className="text-sm text-gray-500 mt-1">
            Los propietarios se crean desde <Link to="/usuarios" className="text-[#126D9B] hover:underline">Usuarios</Link> asignando el rol &quot;Propietario&quot;.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => {
            const name = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.email || 'Sin nombre';
            const count = getPropertyCount(owner.id);

            return (
              <Card
                key={owner.id}
                className="p-4 cursor-pointer hover:shadow-md hover:border-[#126D9B]/30 transition-all"
                onClick={() => setSelectedOwner(owner)}
              >
                <div className="flex items-start gap-4">
                  <OwnerAvatar owner={owner} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{name}</p>
                    {owner.email && (
                      <p className="text-sm text-gray-500 truncate">{owner.email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {count} {count === 1 ? 'propiedad' : 'propiedades'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedOwner && (
        <OwnerDetailPanel
          owner={selectedOwner}
          houses={houses}
          onClose={() => setSelectedOwner(null)}
        />
      )}
    </div>
  );
}
