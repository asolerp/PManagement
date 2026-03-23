import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useIncidences, useHouses, useCreateIncidence, useWorkersFirestore, useSettings } from '@/hooks/useFirestore';
import IncidenceDetailPanel, { StateBadge, SlaBadge, StaleBadge } from '@/components/IncidenceDetailPanel';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Home,
  Camera,
  Clock,
  Plus,
  Hourglass,
  UserX,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
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
    return format(date, 'd MMM yyyy, HH:mm', { locale: es });
  } catch {
    return '—';
  }
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
