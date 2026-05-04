import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-subtle)] dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      {title && (
        <h3 className="font-heading text-base font-semibold text-stone-800 dark:text-stone-100">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
