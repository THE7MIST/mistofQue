import { CheckCircle2 } from "lucide-react";

export default function QuizOption({ letter, children, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`focus-ring group flex min-h-14 w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-semibold transition duration-150 sm:p-4 ${
        selected
          ? "border border-teal-700 bg-teal-50 text-teal-950 shadow-sm dark:border-teal-300 dark:bg-teal-300/18 dark:text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:border-teal-300/60 dark:hover:bg-teal-400/10"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${
          selected
            ? "bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950"
            : "bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800 dark:bg-white/10 dark:text-slate-200 dark:group-hover:bg-teal-300/20"
        }`}
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1 leading-6">{children}</span>
      {selected ? <CheckCircle2 className="shrink-0 text-teal-700 dark:text-teal-200" size={19} /> : null}
    </button>
  );
}
