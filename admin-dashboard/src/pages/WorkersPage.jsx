import { Card } from '@/components/ui/Card';
import { useWorkers } from '@/hooks/useWorkShifts';
import { Mail } from 'lucide-react';

export default function WorkersPage() {
  const { data, isLoading } = useWorkers();
  const workers = data?.workers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
        <p className="text-gray-500">
          Lista de trabajadores registrados en el sistema
        </p>
      </div>

      {/* Workers grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : workers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay trabajadores registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <Card key={worker.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {worker.photo ? (
                    <img
                      src={worker.photo}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {worker.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {worker.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
