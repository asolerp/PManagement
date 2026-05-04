import { Search } from 'lucide-react';

export function FilterBar({ search, onSearchChange, searchPlaceholder = 'Buscar…', children, right, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-turquoise-500/30 focus:border-turquoise-500 transition"
          />
        </div>
      )}
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function FilterChip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition ${
        active
          ? 'bg-turquoise-500 border-turquoise-500 text-white'
          : 'bg-[var(--surface-elevated)] border-[var(--border)] text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
      }`}
    >
      {children}
      {count != null && (
        <span className={`px-1.5 rounded-full text-[10px] ${active ? 'bg-white/25 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default FilterBar;
