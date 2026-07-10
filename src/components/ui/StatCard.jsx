export default function StatCard({ label, value, icon: Icon, detail, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-500/12 text-teal-700 dark:text-teal-200",
    amber: "bg-amber-500/14 text-amber-700 dark:text-amber-200",
    rose: "bg-rose-500/12 text-rose-700 dark:text-rose-200",
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
    indigo: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-200"
  };

  return (
    <div className="glass-panel rounded-lg p-4 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone] || tones.teal}`}>
            <Icon size={22} />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{detail}</p> : null}
    </div>
  );
}
