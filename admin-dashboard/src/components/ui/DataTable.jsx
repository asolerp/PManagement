import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

function defaultCompare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), 'es', { numeric: true });
}

export function DataTable({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectedRowKey,
  emptyState,
  initialSort,
  className = '',
  containerClassName = '',
}) {
  const [sort, setSort] = useState(initialSort ?? null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const accessor = col.sortAccessor ?? ((row) => row[col.key]);
    const dir = sort.dir === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => defaultCompare(accessor(a), accessor(b)) * dir);
  }, [rows, columns, sort]);

  const handleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const hasRows = sortedRows.length > 0;

  return (
    <div className={`overflow-auto ${containerClassName}`}>
      <table className={`dt-table ${className}`}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              const Icon = !isSorted ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      {col.label}
                      <Icon className={`w-3 h-3 ${isSorted ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400'}`} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            sortedRows.map((row) => {
              const key = getRowKey(row);
              const selected = selectedRowKey != null && selectedRowKey === key;
              return (
                <tr
                  key={key}
                  className={`${onRowClick ? 'is-clickable' : ''} ${selected ? 'is-selected' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => {
                    const value = col.render ? col.render(row) : row[col.key];
                    return (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align ?? 'left' }}
                        className={col.cellClassName ?? ''}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="!p-0">
                <div className="py-16">{emptyState}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
