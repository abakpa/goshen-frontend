export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
      <p className="font-bold">Unable to load this data</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button className="mt-3 min-h-10 rounded-md bg-red-700 px-4 text-sm font-bold text-white focus-ring" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
