import { Card } from '@/components/ui/Card';
import { useRecycleBin } from '@/hooks/useFirestore';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatChecklistDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (value.seconds) {
      date = new Date(value.seconds * 1000);
    } else if (value._d) {
      date = value._d;
    } else {
      date = new Date(value);
    }
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM yyyy", { locale: es });
  } catch {
    return '—';
  }
}

export default function RecycleBinPage() {
  const { data: items = [], isLoading } = useRecycleBin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Papelera de reciclaje</h1>
        <p className="text-gray-500">
          Elementos eliminados. La restauración se realiza desde la app móvil.
        </p>
      </div>

      {!isLoading && items.length > 0 && (
        <p className="text-sm text-gray-500">
          {items.length} elemento{items.length !== 1 ? 's' : ''} en la papelera
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          La papelera está vacía
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const houseName =
              item.house?.[0]?.houseName ||
              item.houseName ||
              'Sin casa';

            return (
              <Card key={item.id} className="p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700">{houseName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Fecha: {formatChecklistDate(item.date)}
                      {item.finished && ' · Finalizado'}
                    </p>
                    {item.observations && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {item.observations}
                      </p>
                    )}
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
