import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useRecycleBin } from '@/hooks/useFirestore';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DataTable } from '@/components/ui/DataTable';
import { Pill } from '@/components/ui/Pill';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

function toJsDate(value) {
  if (!value) return null;
  try {
    let d = null;
    if (value.toDate && typeof value.toDate === 'function') d = value.toDate();
    else if (value.seconds != null) d = new Date(value.seconds * 1000);
    else if (value._d instanceof Date) d = value._d;
    else d = new Date(value);
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

function formatChecklistDate(value) {
  const d = toJsDate(value);
  if (!d) return '—';
  return format(d, 'd MMM yyyy', { locale: es });
}

export default function RecycleBinPage() {
  const { data: items = [], isLoading } = useRecycleBin();

  const columns = useMemo(
    () => [
      {
        key: 'house',
        label: 'Casa',
        sortable: true,
        sortAccessor: (i) => i.house?.[0]?.houseName || i.houseName || '',
        render: (i) => {
          const name = i.house?.[0]?.houseName || i.houseName || 'Sin casa';
          return (
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </span>
              <span className="font-medium text-stone-700 dark:text-stone-200 truncate">{name}</span>
            </div>
          );
        },
      },
      {
        key: 'observations',
        label: 'Observaciones',
        render: (i) =>
          i.observations ? (
            <span className="text-stone-500 truncate">{i.observations}</span>
          ) : (
            <span className="text-stone-400">—</span>
          ),
      },
      {
        key: 'state',
        label: 'Estado',
        render: (i) => (i.finished ? <Pill variant="resolved">Finalizado</Pill> : <Pill variant="neutral">Borrador</Pill>),
      },
      {
        key: 'date',
        label: 'Fecha',
        sortable: true,
        align: 'right',
        sortAccessor: (i) => toJsDate(i.date)?.getTime() ?? 0,
        render: (i) => (
          <span className="font-mono tabular-nums text-xs text-stone-500">
            {formatChecklistDate(i.date)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={['Administración', 'Papelera']}
        title="Papelera de reciclaje"
        subtitle={
          isLoading
            ? 'Cargando…'
            : `${items.length} ${items.length === 1 ? 'elemento' : 'elementos'} eliminados · Restauración desde la app móvil`
        }
      />

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500">Cargando…</div>
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(i) => i.id}
            initialSort={{ key: 'date', dir: 'desc' }}
            emptyState={
              <EmptyState
                icon={Trash2}
                title="La papelera está vacía"
                description="Los elementos eliminados aparecerán aquí antes de borrarse permanentemente."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
