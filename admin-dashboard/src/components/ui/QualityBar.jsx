export function QualityBar({ value, showValue = true, className = '' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const level = v < 60 ? 'bad' : v < 80 ? 'warn' : 'good';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="quality-bar" aria-hidden="true">
        <span
          className="quality-bar-fill"
          data-level={level}
          style={{ width: `${v}%` }}
        />
      </span>
      {showValue && (
        <span className="font-mono tabular-nums text-xs text-stone-600 dark:text-stone-300">
          {Math.round(v)}
        </span>
      )}
    </span>
  );
}

export default QualityBar;
