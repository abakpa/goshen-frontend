import { forwardRef } from 'react';

const SelectField = forwardRef(function SelectField({ label, error, children, className = '', ...props }, ref) {
  return (
    <label className={`block text-sm font-semibold ${className}`}>
      {label}
      <select
        ref={ref}
        className={`mt-2 min-h-12 w-full rounded-md border px-3 font-normal outline-none focus:border-burgundy-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
});

export default SelectField;
