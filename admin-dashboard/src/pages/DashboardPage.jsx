import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useWorkShiftStats, useWorkShifts } from '@/hooks/useWorkShifts';

function StatCard({ icon: Icon, label, value, subvalue, color }) {
  const colors = {
    primary: 'bg-[#126D9B]/10 text-[#126D9B]',
    secondary: 'bg-[#3B8D7A]/10 text-[#3B8D7A]',
    accent: 'bg-[#67B26F]/10 text-[#67B26F]',
    warning: 'bg-amber-100 text-amber-600',
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subvalue && (
              <p className="text-xs text-gray-400">{subvalue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentShiftsTable({ shifts }) {
  if (!shifts?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay jornadas registradas hoy
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Trabajador
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Entrada
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Salida
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Total
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                  <span className="font-medium text-gray-900">
                    {shift.workerName}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.firstEntry
                  ? format(new Date(shift.firstEntry), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.lastExit
                  ? format(new Date(shift.lastExit), 'HH:mm')
                  : '-'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {shift.totalMinutes > 0
                  ? `${Math.floor(shift.totalMinutes / 60)}h ${shift.totalMinutes % 60}m`
                  : '-'}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: statsData, isLoading: statsLoading } = useWorkShiftStats(today);
  const { data: shiftsData, isLoading: shiftsLoading } = useWorkShifts({
    startDate: today,
    endDate: today,
    limit: 10,
  });

  const stats = statsData?.stats || {};
  const shifts = shiftsData?.shifts || [];

  const formatHours = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Trabajadores hoy"
          value={statsLoading ? '...' : stats.totalWorkersToday || 0}
          subvalue={`de ${stats.totalRegisteredWorkers || 0} registrados`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          label="Jornadas completadas"
          value={statsLoading ? '...' : stats.completedShifts || 0}
          color="accent"
        />
        <StatCard
          icon={AlertCircle}
          label="En curso"
          value={statsLoading ? '...' : stats.inProgressShifts || 0}
          color="warning"
        />
        <StatCard
          icon={Clock}
          label="Horas trabajadas"
          value={statsLoading ? '...' : formatHours(stats.totalMinutesWorked)}
          subvalue="total del día"
          color="secondary"
        />
      </div>

      {/* Recent shifts */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Jornadas de hoy
          </h2>
        </div>
        <div className="p-4">
          {shiftsLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <RecentShiftsTable shifts={shifts} />
          )}
        </div>
      </Card>
    </div>
  );
}
