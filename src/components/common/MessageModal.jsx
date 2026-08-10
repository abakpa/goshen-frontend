export default function MessageModal({
  open,
  title,
  message,
  children,
  confirmLabel = 'OK',
  cancelLabel,
  tone = 'neutral',
  submitting = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  const confirmStyles = {
    neutral: 'bg-ink text-white',
    danger: 'bg-red-600 text-white',
    success: 'bg-emerald-600 text-white'
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <section className="w-full max-w-md rounded-lg bg-white p-4 shadow-soft">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {message && <p className="mt-2 text-sm leading-6 text-stone-500">{message}</p>}
        </div>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {cancelLabel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="min-h-11 rounded-md border border-stone-200 px-4 font-semibold focus-ring disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm || onCancel}
            disabled={submitting}
            className={`min-h-11 rounded-md px-4 font-bold focus-ring disabled:opacity-60 ${cancelLabel ? '' : 'col-span-2'} ${confirmStyles[tone] || confirmStyles.neutral}`}
          >
            {submitting ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
