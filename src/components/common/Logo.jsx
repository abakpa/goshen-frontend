export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-burgundy-700 text-sm font-bold text-gold shadow-soft">
        GC
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide text-ink">GOSHEN</p>
          <p className="text-xs font-semibold text-burgundy-600">COLLECTION</p>
        </div>
      )}
    </div>
  );
}
