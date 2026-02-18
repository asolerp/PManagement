import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useChecklists } from '@/hooks/useFirestore';
import { CheckSquare, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import ChecklistDetailPanel from '@/components/ChecklistDetailPanel';

function formatChecklistDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') date = value.toDate();
    else if (value.seconds) date = new Date(value.seconds * 1000);
    else if (value._d) date = value._d;
    else date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM yyyy", { locale: es });
  } catch {
    return '—';
  }
}

export default function ChecklistsPage() {
  const [filterFinished, setFilterFinished] = useState(undefined);
  const { data: checklists = [], isLoading } = useChecklists({
    ...(filterFinished !== undefined && { finished: filterFinished }),
  });
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
        <p className="text-gray-500">
          Listas de comprobación por casa y fecha
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterFinished === undefined ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(undefined)}
        >
          Todos
        </Button>
        <Button
          variant={filterFinished === false ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(false)}
        >
          En curso
        </Button>
        <Button
          variant={filterFinished === true ? 'primary' : 'outline'}
          onClick={() => setFilterFinished(true)}
        >
          Finalizados
        </Button>
      </div>

      {!isLoading && checklists.length > 0 && (
        <p className="text-sm text-gray-500">
          {checklists.length} checklist{checklists.length !== 1 ? 's' : ''}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay checklists
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((cl) => {
            const houseName =
              cl.house?.[0]?.houseName ||
              cl.houseName ||
              'Sin casa';
            const progress =
              cl.total > 0
                ? `${Math.min(cl.done || 0, cl.total)}/${cl.total}`
                : '—';

            return (
              <Card
                key={cl.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedChecklist(cl)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      cl.finished
                        ? 'bg-[#67B26F]/10 text-[#67B26F]'
                        : 'bg-[#126D9B]/10 text-[#126D9B]'
                    }`}
                  >
                    {cl.finished ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <CheckSquare className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{houseName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Fecha: {formatChecklistDate(cl.date)} · {progress} checks
                    </p>
                    {cl.observations && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {cl.observations}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {cl.finished && (
                        <span className="text-[#67B26F] font-medium">
                          Finalizado
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

      {selectedChecklist && (
        <ChecklistDetailPanel
          checklist={selectedChecklist}
          onClose={() => setSelectedChecklist(null)}
        />
      )}
    </div>
  );
}
