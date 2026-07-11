import { ArrowRight, CheckCircle2, Circle, Medal } from "lucide-react";
import { Link } from "react-router-dom";

const stateStyles = {
  "not-started": "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
  attempted: "bg-amber-500/14 text-amber-700 dark:text-amber-200",
  completed: "bg-teal-500/12 text-teal-700 dark:text-teal-200",
  mastered: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200"
};

const stateLabels = {
  "not-started": "Not started",
  attempted: "Attempted",
  completed: "Completed",
  mastered: "Mastered"
};

function StateIcon({ state }) {
  if (state === "completed" || state === "mastered") return <CheckCircle2 size={14} />;
  return <Circle size={14} />;
}

export default function SubjectProgressCard({ progress }) {
  const { subject } = progress;
  const Icon = subject.icon;
  const primaryStage = subject.stages[0];

  return (
    <article className="rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950 dark:text-white">{subject.name}</h3>
            {progress.isMastered ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-200">
                <Medal size={13} />
                Mastered
              </span>
            ) : progress.isFinished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/12 px-2 py-0.5 text-xs font-black text-teal-700 dark:text-teal-200">
                <CheckCircle2 size={13} />
                Finished
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{subject.description}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-950 dark:text-white">{progress.progress}% complete</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {progress.completed} of {progress.total} sets completed
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress.progress}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{progress.message}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Attempted {progress.attempted}. Best {progress.bestScore}%. Average {progress.averageScore}%.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {progress.categoryCounts.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
        {progress.quizzes.map((quiz) => (
          <div key={quiz.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{quiz.label}</span>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ${stateStyles[quiz.state]}`}>
              <StateIcon state={quiz.state} />
              {stateLabels[quiz.state]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={primaryStage.path}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Warm up <ArrowRight size={16} />
        </Link>
        <Link
          to={subject.topicsPath}
          className="focus-ring inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          Topics
        </Link>
      </div>
    </article>
  );
}
