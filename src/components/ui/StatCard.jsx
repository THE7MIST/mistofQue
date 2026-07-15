export default function StatCard({ label, value, icon: Icon, detail, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-500/12 text-teal-800 dark:text-teal-100",
    amber: "bg-amber-500/14 text-amber-800 dark:text-amber-100",
    rose: "bg-rose-500/12 text-rose-800 dark:text-rose-100",
    emerald: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-100",
    indigo: "bg-slate-500/12 text-slate-700 dark:text-slate-200"
  };

  return (
    <div className="glass-panel rounded-lg p-4 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="metric-number mt-2 text-3xl">{value}</p>
        </div>
        {Icon ? (
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone] || tones.teal}`}>
            <Icon size={22} />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{detail}</p> : null}
    </div>
  );
}
