import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  ArrowLeft,
  Mail,
  Phone,
  Home,
  MessageSquare,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { OwnerDocumentsSection } from './OwnersPage';

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

function OwnerAvatar({ owner, size = 'md' }) {
  const photoUrl = getSafeImageUrl(owner?.profileImage?.small ?? owner?.photoUrl);
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-lg';
  const initial = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ').charAt(0)?.toUpperCase() || owner?.name?.charAt(0) || '?';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover bg-gray-200`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center text-white font-semibold`}>
      {initial}
    </div>
  );
}

export default function OwnerDetailPage() {
  const { id } = useParams();
  const { data: owners = [] } = useOwners();
  const { data: houses = [] } = useHouses();
  const owner = owners.find((o) => o.id === id);

  const { data: incidences = [], isLoading: loadingIncidences } = useIncidences();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();
  const { data: documents = [], isLoading: loadingDocs } = useOwnerDocuments(owner?.id);
  const uploadDoc = useUploadOwnerDocument();
  const deleteDoc = useDeleteOwnerDocument();

  const ownerHouses = useMemo(
    () => houses.filter((h) => h.owner?.id === id),
    [houses, id]
  );
  const ownerHouseIds = useMemo(() => new Set(ownerHouses.map((h) => h.id)), [ownerHouses]);
  const houseNameById = useMemo(
    () => Object.fromEntries(ownerHouses.map((h) => [h.id, h.houseName || 'Sin nombre'])),
    [ownerHouses]
  );

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

  if (!owner) {
    return (
      <div className="space-y-4">
        <Link to="/propietarios" className="inline-flex items-center gap-2 text-sm text-[#126D9B] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver a Propietarios
        </Link>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Propietario no encontrado.</p>
        </Card>
      </div>
    );
  }

  const displayName = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.email || 'Sin nombre';
  const loadingHistory = loadingIncidences || loadingJobs;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/propietarios"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#126D9B] transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Propietarios
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 truncate">
          {displayName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <OwnerAvatar owner={owner} size="lg" />
              <div className="space-y-2 min-w-0">
                {owner.email && (
                  <a
                    href={`mailto:${owner.email}`}
                    className="flex items-center gap-2 text-sm text-[#126D9B] hover:underline"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {owner.email}
                  </a>
                )}
                {owner.phone && (
                  <a
                    href={`tel:${owner.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#126D9B]"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {owner.phone}
                  </a>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Para editar datos del propietario usa la sección <Link to="/usuarios" className="text-[#126D9B] hover:underline">Usuarios</Link>.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#126D9B]" />
              Propiedades ({ownerHouses.length})
            </h2>
            {ownerHouses.length === 0 ? (
              <p className="text-sm text-gray-500">Sin propiedades asignadas.</p>
            ) : (
              <ul className="space-y-2">
                {ownerHouses.map((house) => (
                  <li key={house.id}>
                    <Link
                      to={`/casas/${house.id}`}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#126D9B]/40 hover:bg-[#126D9B]/5 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-[#126D9B]">
                          {house.houseName || 'Sin nombre'}
                        </p>
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
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#126D9B]" />
              Comunicación / historial
            </h2>
            {loadingHistory ? (
              <p className="text-sm text-gray-500">Cargando historial...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-gray-500">Sin incidencias ni trabajos en sus propiedades.</p>
            ) : (
              <ul className="space-y-2">
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
          </Card>

          <Card className="p-6">
            <OwnerDocumentsSection
              ownerId={owner.id}
              documents={documents}
              loading={loadingDocs}
              uploadDoc={uploadDoc}
              deleteDoc={deleteDoc}
            />
          </Card>
        </div>

        <div className="space-y-4" />
      </div>
    </div>
  );
}
