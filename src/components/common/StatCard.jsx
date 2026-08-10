import { formatCurrency } from '../../utils/currency.js';

export default function StatCard({ label, value, tone = 'neutral', currency = false, icon: Icon }) {
  const tones = {
    neutral: 'bg-white text-ink',
    green: 'bg-emerald-50 text-emerald-800',
    red: 'bg-red-50 text-red-800',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-blue-50 text-blue-800',
    purple: 'bg-purple-50 text-purple-800'
  };

  return (
    <section className={`min-w-0 rounded-lg border border-black/5 p-3 shadow-soft sm:p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-medium leading-snug opacity-75 sm:text-sm">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />}
      </div>
      <p className="mt-3 break-words text-lg font-bold leading-tight tracking-normal sm:text-2xl">{currency ? formatCurrency(value) : value}</p>
    </section>
  );
}
