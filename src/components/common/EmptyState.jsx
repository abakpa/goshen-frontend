export default function EmptyState({ title = 'No records found', message = 'Records will appear here when they are available.' }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm text-stone-500">{message}</p>
    </div>
  );
}
