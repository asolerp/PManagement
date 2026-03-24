import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, size, className = '', ...props }, ref) => {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-2 text-sm rounded-lg'
    : 'px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full ${sizeClasses} border
          bg-white dark:bg-stone-800
          text-stone-900 dark:text-stone-100
          placeholder-stone-400 dark:placeholder-stone-500
          focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent
          disabled:bg-stone-50 dark:disabled:bg-stone-900 disabled:text-stone-500 dark:disabled:text-stone-600
          transition-shadow
          ${error ? 'border-red-400 focus:ring-red-500' : 'border-[var(--border)] dark:border-stone-700'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
