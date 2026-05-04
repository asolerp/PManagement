const VARIANTS = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  resolved: 'badge-resolved',
  neutral: 'pill-neutral',
  info: 'pill-info',
};

export function Pill({ variant = 'neutral', size = 'sm', dot = false, children, className = '' }) {
  const variantClass = VARIANTS[variant] ?? VARIANTS.neutral;
  const sizeClass = size === 'md' ? 'pill-md' : '';
  return (
    <span className={`pill ${sizeClass} ${variantClass} ${className}`}>
      {dot && <span className="pill-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Pill;
