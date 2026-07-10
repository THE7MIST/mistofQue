export default function ProgressBar({ value, max = 100, label }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {label ? <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300 dark:bg-teal-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
