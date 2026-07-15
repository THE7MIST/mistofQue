export default function ProgressBar({ value, max = 100, label }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {label ? <div className="mb-2 text-sm font-bold text-slate-600 dark:text-slate-300">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 ring-1 ring-inset ring-slate-300/60 dark:bg-white/10 dark:ring-white/10">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-300 dark:bg-teal-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
