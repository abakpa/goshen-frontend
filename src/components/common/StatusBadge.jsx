const styles = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-stone-100 text-stone-600',
  pending: 'bg-amber-50 text-amber-700',
  'pending-approval': 'bg-amber-50 text-amber-700',
  overdue: 'bg-red-50 text-red-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
  processing: 'bg-blue-50 text-blue-700',
  default: 'bg-purple-50 text-purple-700'
};

export default function StatusBadge({ status }) {
  const normalized = String(status || 'default').toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[normalized] || styles.default}`}>
      {status || 'Unknown'}
    </span>
  );
}
