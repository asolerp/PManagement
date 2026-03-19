import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, size, className = '', ...props }, ref) => {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-2 text-sm rounded-lg'
    : 'px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl';

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-stone-600 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={`
          w-full ${sizeClasses} border
          text-stone-900 placeholder-stone-400
          focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent
          disabled:bg-stone-50 disabled:text-stone-500
          transition-shadow
          ${error ? 'border-red-400 focus:ring-red-500' : 'border-[var(--border)]'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
