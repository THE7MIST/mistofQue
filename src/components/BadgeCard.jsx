import { Lock, Trophy } from "lucide-react";

export default function BadgeCard({ badge }) {
  return (
    <div
      className={`rounded-lg border p-3 transition duration-150 ${
        badge.earned
          ? "border-amber-300/70 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-300/30 dark:bg-amber-400/12 dark:text-amber-100"
          : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
            badge.earned ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
          }`}
        >
          {badge.earned ? <Trophy size={19} /> : <Lock size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-slate-950 dark:text-white">{badge.title}</h3>
            <span className="text-xs font-black">{badge.earned ? "Earned" : "Locked"}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{badge.condition}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className={`h-full rounded-full transition-all duration-300 ${badge.earned ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${badge.progress}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            {badge.current}/{badge.target}
          </p>
        </div>
      </div>
    </div>
  );
}
