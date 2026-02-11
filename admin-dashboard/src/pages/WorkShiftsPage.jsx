import { useState, useMemo } from 'react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Pencil,
  Trash2,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useWorkShifts, useWorkers, useDeleteWorkShift } from '@/hooks/useWorkShifts';
import CreateShiftModal from '@/components/WorkShifts/CreateShiftModal';
import EditShiftModal from '@/components/WorkShifts/EditShiftModal';

// Opciones de periodo predefinidas
const periodOptions = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'lastMonth', label: 'Mes anterior' },
  { id: 'year', label: 'Este año' },
  { id: 'custom', label: 'Personalizado' },
];

const getDateRange = (periodId) => {
  const today = new Date();
  
  switch (periodId) {
    case 'today':
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    case 'year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(endOfYear(today), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
  }
};

export default function WorkShiftsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filters, setFilters] = useState({
    ...getDateRange('month'),
    workerId: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  const { data, isLoading, refetch } = useWorkShifts(filters);
  const { data: workersData } = useWorkers();
  const deleteShift = useDeleteWorkShift();

  const shifts = data?.shifts || [];
  const workers = workersData?.workers || [];

  // Ordenar shifts
  const sortedShifts = [...shifts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date || a.firstEntry) - new Date(b.date || b.firstEntry);
        break;
      case 'worker':
        comparison = (a.workerName || '').localeCompare(b.workerName || '');
        break;
      case 'entry':
        comparison = new Date(a.firstEntry || 0) - new Date(b.firstEntry || 0);
        break;
      case 'exit':
        comparison = new Date(a.lastExit || 0) - new Date(b.lastExit || 0);
        break;
      case 'duration':
        comparison = (a.totalMinutes || 0) - (b.totalMinutes || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-[#126D9B]" />
      : <ArrowDown className="w-3.5 h-3.5 text-[#126D9B]" />;
  };

  const SortableHeader = ({ field, children, className = '' }) => (
    <th 
      className={`text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    if (periodId !== 'custom') {
      const dateRange = getDateRange(periodId);
      setFilters(prev => ({ ...prev, ...dateRange }));
    }
  };

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

  // Calculate totals
  const totalHours = shifts.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);
  const completedCount = shifts.filter(s => s.status === 'completed').length;

  // Calcular totales por trabajador para el informe
  const workerTotals = useMemo(() => {
    const totals = new Map();
    
    shifts.forEach((shift) => {
      const workerId = shift.workerId;
      if (!totals.has(workerId)) {
        totals.set(workerId, {
          name: shift.workerName || 'Sin nombre',
          totalMinutes: 0,
          daysWorked: 0,
          completedShifts: 0,
        });
      }
      const worker = totals.get(workerId);
      worker.totalMinutes += shift.totalMinutes || 0;
      worker.daysWorked += 1;
      if (shift.status === 'completed') {
        worker.completedShifts += 1;
      }
    });

    return Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts]);

  // Exportar a Excel
  const exportToExcel = () => {
    if (!shifts.length) {
      alert('No hay datos para exportar');
      return;
    }

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const monthYearStr = format(start, 'MMMM yyyy', { locale: es });
    const monthYearLabel = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1);
    const periodLabel = `${format(start, 'dd/MM/yyyy')} a ${format(end, 'dd/MM/yyyy')}`;

    // Hoja 0: Informe (cabecera + totales por trabajador)
    const totalMinutesAll = workerTotals.reduce((sum, w) => sum + w.totalMinutes, 0);
    const totalDaysAll = workerTotals.reduce((sum, w) => sum + w.daysWorked, 0);
    const summaryRows = workerTotals.map((worker) => [
      worker.name,
      worker.daysWorked,
      worker.completedShifts,
      Math.floor(worker.totalMinutes / 60),
      worker.totalMinutes % 60,
      (worker.totalMinutes / 60).toFixed(2),
      worker.daysWorked > 0 ? (worker.totalMinutes / 60 / worker.daysWorked).toFixed(2) : '0.00',
    ]);
    summaryRows.push([
      'TOTAL',
      totalDaysAll,
      workerTotals.reduce((sum, w) => sum + w.completedShifts, 0),
      Math.floor(totalMinutesAll / 60),
      totalMinutesAll % 60,
      (totalMinutesAll / 60).toFixed(2),
      '-',
    ]);
    const reportHeader = [
      ['Informe de jornadas laborales'],
      [],
      ['Mes y año:', monthYearLabel],
      ['Periodo:', periodLabel],
      ['N.º jornadas en el informe:', shifts.length],
      [],
      [
        'Este informe recoge las jornadas laborales registradas en el periodo indicado. '
        + 'A continuación se muestra la tabla de totales por trabajador que aparece en el reporte.',
      ],
      [],
      ['Trabajador', 'Días trabajados', 'Jornadas completadas', 'Horas totales', 'Minutos totales', 'Total horas (decimal)', 'Media horas/día'],
      ...summaryRows,
    ];
    const wsReport = XLSX.utils.aoa_to_sheet(reportHeader);
    wsReport['!cols'] = [
      { wch: 25 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
    ];

    // Hoja 1: Detalle de jornadas
    const detailData = sortedShifts.map((shift) => ({
      'Fecha': shift.date ? format(new Date(shift.date), 'dd/MM/yyyy') : '-',
      'Trabajador': shift.workerName || '-',
      'Entrada': shift.firstEntry ? format(new Date(shift.firstEntry), 'HH:mm') : '-',
      'Salida': shift.lastExit ? format(new Date(shift.lastExit), 'HH:mm') : '-',
      'Horas': shift.totalMinutes ? Math.floor(shift.totalMinutes / 60) : 0,
      'Minutos': shift.totalMinutes ? shift.totalMinutes % 60 : 0,
      'Total (decimal)': shift.totalMinutes ? (shift.totalMinutes / 60).toFixed(2) : '0.00',
      'Estado': shift.status === 'completed' ? 'Completada' : 'En curso',
    }));

    // Hoja 2: Resumen por trabajador (misma tabla que en Informe, por compatibilidad)
    const summaryData = workerTotals.map((worker) => ({
      'Trabajador': worker.name,
      'Días trabajados': worker.daysWorked,
      'Jornadas completadas': worker.completedShifts,
      'Horas totales': Math.floor(worker.totalMinutes / 60),
      'Minutos totales': worker.totalMinutes % 60,
      'Total horas (decimal)': (worker.totalMinutes / 60).toFixed(2),
      'Media horas/día': worker.daysWorked > 0 
        ? (worker.totalMinutes / 60 / worker.daysWorked).toFixed(2) 
        : '0.00',
    }));
    summaryData.push({
      'Trabajador': 'TOTAL',
      'Días trabajados': totalDaysAll,
      'Jornadas completadas': workerTotals.reduce((sum, w) => sum + w.completedShifts, 0),
      'Horas totales': Math.floor(totalMinutesAll / 60),
      'Minutos totales': totalMinutesAll % 60,
      'Total horas (decimal)': (totalMinutesAll / 60).toFixed(2),
      'Media horas/día': '-',
    });

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    wsDetail['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 10 },
      { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
    ];
    wsSummary['!cols'] = [
      { wch: 25 }, { wch: 16 }, { wch: 20 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, wsReport, 'Informe');
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle Jornadas');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Trabajadores');

    const fileName = `Jornadas_${filters.startDate}_a_${filters.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
            onClick={exportToExcel}
            disabled={!shifts.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
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

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {periodOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handlePeriodChange(option.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === option.id
                ? 'bg-[#126D9B] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="date"
              label="Desde"
              value={filters.startDate}
              onChange={(e) => {
                setSelectedPeriod('custom');
                setFilters({ ...filters, startDate: e.target.value });
              }}
            />
            <Input
              type="date"
              label="Hasta"
              value={filters.endDate}
              onChange={(e) => {
                setSelectedPeriod('custom');
                setFilters({ ...filters, endDate: e.target.value });
              }}
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
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                Aplicar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary */}
      {!isLoading && shifts.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{shifts.length} jornadas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700">{completedCount} completadas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">
              {Math.floor(totalHours / 60)}h {totalHours % 60}m total
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <SortableHeader field="worker">Trabajador</SortableHeader>
                <SortableHeader field="date">Fecha</SortableHeader>
                <SortableHeader field="entry">Entrada</SortableHeader>
                <SortableHeader field="exit">Salida</SortableHeader>
                <SortableHeader field="duration">Duración</SortableHeader>
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
              ) : sortedShifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No se encontraron jornadas en el periodo seleccionado
                  </td>
                </tr>
              ) : (
                sortedShifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center">
                          {shift.workerPhoto ? (
                            <img
                              src={shift.workerPhoto}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-white">
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
                      {format(new Date(shift.date), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatTime(shift.firstEntry)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatTime(shift.lastExit)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
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
