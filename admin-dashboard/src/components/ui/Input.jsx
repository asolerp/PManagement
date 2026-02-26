import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, size, className = '', ...props }, ref) => {
  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-2 sm:px-3 py-1.5 sm:py-2 text-[13px] sm:text-sm';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full ${sizeClasses} border rounded-lg
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
