export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-soft)] shadow-[var(--shadow)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-6 py-5 border-b border-[var(--border-soft)] ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`font-heading text-lg font-semibold text-stone-900 ${className}`}>{children}</h3>;
}

export function CardContent({ className = '', children }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`px-6 py-4 border-t border-[var(--border-soft)] ${className}`}>{children}</div>;
}
