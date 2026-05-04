import { ChevronRight } from 'lucide-react';

export function PageHeader({ breadcrumb, title, subtitle, actions, className = '' }) {
  return (
    <header className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
            {breadcrumb.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 opacity-60" />}
                <span className={i === breadcrumb.length - 1 ? 'text-stone-700 dark:text-stone-200 font-medium' : ''}>
                  {b}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}

export default PageHeader;
