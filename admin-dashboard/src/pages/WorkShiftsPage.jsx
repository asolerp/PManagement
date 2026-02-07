import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Download,
  Pencil,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useWorkShifts, useWorkers, useDeleteWorkShift } from '@/hooks/useWorkShifts';
import CreateShiftModal from '@/components/WorkShifts/CreateShiftModal';
import EditShiftModal from '@/components/WorkShifts/EditShiftModal';

export default function WorkShiftsPage() {
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    workerId: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);

  const { data, isLoading, refetch } = useWorkShifts(filters);
  const { data: workersData } = useWorkers();
  const deleteShift = useDeleteWorkShift();

  const shifts = data?.shifts || [];
  const workers = workersData?.workers || [];

  const handleDelete = async (shiftId) => {
    if (!confirm('¿Estás seguro de eliminar esta jornada?')) return;
    try {
      await deleteShift.mutateAsync(shiftId);
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return format(new Date(isoString), 'HH:mm');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jornadas</h1>
          <p className="text-gray-500">
            Gestiona las jornadas laborales de los trabajadores
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva jornada
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="date"
              label="Desde"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
            <Input
              type="date"
              label="Hasta"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajador
              </label>
              <select
                value={filters.workerId}
                onChange={(e) =>
                  setFilters({ ...filters, workerId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
              >
                <option value="">Todos</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
              >
                <option value="">Todos</option>
                <option value="completed">Completadas</option>
                <option value="in_progress">En curso</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => refetch()}>Aplicar filtros</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Trabajador
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Entrada
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Salida
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Duración
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Estado
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No se encontraron jornadas
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {shift.workerPhoto ? (
                            <img
                              src={shift.workerPhoto}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {shift.workerName?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {shift.workerName}
                          </p>
                          {shift.isManual && (
                            <span className="text-xs text-gray-400">Manual</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(shift.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatTime(shift.firstEntry)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatTime(shift.lastExit)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDuration(shift.totalMinutes)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          shift.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {shift.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Completada
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            En curso
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditShift(shift)}
                          className="p-2 text-gray-400 hover:text-[#126D9B] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      {createModalOpen && (
        <CreateShiftModal
          workers={workers}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {editShift && (
        <EditShiftModal
          shift={editShift}
          onClose={() => setEditShift(null)}
        />
      )}
    </div>
  );
}
