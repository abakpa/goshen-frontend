export default function SkeletonBlock({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg bg-white/70 shadow-soft" />
      ))}
    </div>
  );
}
