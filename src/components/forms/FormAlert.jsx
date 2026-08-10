export default function FormAlert({ type = 'error', message }) {
  if (!message) return null;
  const styles = type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100';
  return <div className={`rounded-md border px-3 py-2 text-sm font-semibold ${styles}`}>{message}</div>;
}
