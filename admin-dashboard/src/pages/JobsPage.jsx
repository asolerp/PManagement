import { Card } from '@/components/ui/Card';
import { useJobs } from '@/hooks/useFirestore';
import { Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Finalizado',
  cancelled: 'Cancelado'
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-[#126D9B]/10 text-[#126D9B]',
  done: 'bg-[#67B26F]/10 text-[#67B26F]',
  cancelled: 'bg-gray-100 text-gray-600'
};

export default function JobsPage() {
  const { data: jobs = [], isLoading } = useJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trabajos</h1>
        <p className="text-gray-500">
          Trabajos o tareas asignadas a casas y trabajadores
        </p>
      </div>

      {!isLoading && jobs.length > 0 && (
        <p className="text-sm text-gray-500">
          {jobs.length} trabajo{jobs.length !== 1 ? 's' : ''}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay trabajos
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const status = job.status || 'pending';
            const label = statusLabels[status] || status;
            const colorClass = statusColors[status] || statusColors.pending;

            return (
              <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#126D9B]/10 text-[#126D9B]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {job.title || job.jobName || 'Sin título'}
                    </p>
                    {job.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}
                      >
                        {label}
                      </span>
                      {job.createdAt?.toDate && (
                        <span className="text-xs text-gray-400">
                          {format(job.createdAt.toDate(), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
