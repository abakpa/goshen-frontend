import { forwardRef } from 'react';

const TextField = forwardRef(function TextField({ label, error, as = 'input', className = '', ...props }, ref) {
  const Component = as;
  return (
    <label className={`block text-sm font-semibold ${className}`}>
      {label}
      <Component
        ref={ref}
        className={`mt-2 min-h-12 w-full rounded-md border px-3 font-normal outline-none focus:border-burgundy-500 ${
          as === 'textarea' ? 'py-3' : ''
        } ${error ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
});

export default TextField;
