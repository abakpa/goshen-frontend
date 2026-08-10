import { Children, forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown } from 'react-icons/fa6';

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}

const SelectField = forwardRef(function SelectField({ label, error, children, className = '', ...props }, ref) {
  const {
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    disabled,
    required,
    id,
    ...selectProps
  } = props;
  const generatedId = useId();
  const fieldId = id || `select-${generatedId}`;
  const buttonRef = useRef(null);
  const nativeSelectRef = useRef(null);
  const menuRef = useRef(null);
  const isControlled = value !== undefined;
  const options = useMemo(
    () => Children.toArray(children)
      .filter((child) => child?.type === 'option')
      .map((child) => ({
        value: String(child.props.value ?? ''),
        label: child.props.children,
        disabled: Boolean(child.props.disabled)
      })),
    [children]
  );
  const firstValue = options[0]?.value ?? '';
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? firstValue));
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const selectedValue = String(isControlled ? value : internalValue);
  const selectedOption = options.find((option) => option.value === selectedValue) || options[0];

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    setMenuPosition({
      left: rect.left,
      top: rect.bottom + 4,
      width: rect.width,
      maxHeight: Math.max(160, Math.min(256, spaceBelow))
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (
        buttonRef.current?.contains(event.target)
        || menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, selectedValue]);

  useEffect(() => {
    const nativeSelect = nativeSelectRef.current;
    if (!nativeSelect) return undefined;

    const syncFromNativeSelect = () => {
      if (!isControlled) {
        setInternalValue(String(nativeSelect.value ?? ''));
      }
    };

    const form = nativeSelect.form;
    form?.addEventListener('reset', syncFromNativeSelect);
    return () => form?.removeEventListener('reset', syncFromNativeSelect);
  }, [isControlled]);

  useEffect(() => {
    if (nativeSelectRef.current && nativeSelectRef.current.value !== selectedValue) {
      nativeSelectRef.current.value = selectedValue;
    }
  }, [selectedValue]);

  const emitChange = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    if (nativeSelectRef.current) {
      nativeSelectRef.current.value = nextValue;
    }

    onChange?.({
      type: 'change',
      target: nativeSelectRef.current || { name, value: nextValue },
      currentTarget: nativeSelectRef.current || { name, value: nextValue }
    });
  };

  const emitBlur = () => {
    onBlur?.({
      type: 'blur',
      target: nativeSelectRef.current || { name, value: selectedValue },
      currentTarget: nativeSelectRef.current || { name, value: selectedValue }
    });
  };

  const selectOption = (option) => {
    if (option.disabled || disabled) return;
    emitChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    const activeIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      let nextIndex = activeIndex;

      for (let step = 0; step < options.length; step += 1) {
        nextIndex = (nextIndex + direction + options.length) % options.length;
        if (!options[nextIndex]?.disabled) {
          emitChange(options[nextIndex].value);
          break;
        }
      }
    }
  };

  return (
    <label className={`relative z-20 block min-w-0 overflow-visible text-sm font-semibold ${open ? 'z-50' : ''} ${className}`}>
      <span>{label}</span>
      <button
        ref={buttonRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onBlur={emitBlur}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={`mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-md border bg-white px-3 text-left font-normal text-ink outline-none focus:z-30 focus:border-burgundy-500 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'
        }`}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedOption?.value ? '' : 'text-stone-500'}`}>
          {selectedOption?.label || 'Select option'}
        </span>
        <FaChevronDown className={`h-3 w-3 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <select
        ref={mergeRefs(nativeSelectRef, ref)}
        id={`${fieldId}-native`}
        name={name}
        value={selectedValue}
        defaultValue={isControlled ? undefined : defaultValue}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 h-1 opacity-0"
        onChange={onChange}
        onBlur={onBlur}
        {...selectProps}
      >
        {children}
      </select>
      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-labelledby={fieldId}
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            width: `${menuPosition.width}px`,
            maxHeight: `${menuPosition.maxHeight}px`
          }}
          className="fixed z-[9999] overflow-y-auto overscroll-contain rounded-md border border-stone-200 bg-white py-1 text-sm font-normal text-ink shadow-xl"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              className={`block min-h-11 w-full px-3 py-2 text-left disabled:cursor-not-allowed disabled:text-stone-400 ${
                option.value === selectedValue ? 'bg-burgundy-50 font-bold text-burgundy-700' : 'hover:bg-cream'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
});

export default SelectField;
