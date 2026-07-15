import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "./ui/ProgressBar.jsx";
import StatusBadge from "./ui/StatusBadge.jsx";

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
  const nextQuiz = progress.quizzes.find((quiz) => quiz.state === "not-started") || progress.quizzes[0];
  const subjectStatus = progress.isMastered ? "Mastered" : progress.isFinished ? "Finished" : progress.attempted ? "In progress" : "Start";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 transition duration-150 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-teal-800 dark:text-teal-100">
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-bold text-slate-950 dark:text-white">{subject.name}</h3>
            <StatusBadge tone={progress.isMastered ? "success" : progress.isFinished ? "accent" : "neutral"}>
              {subjectStatus}
            </StatusBadge>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{subject.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-950 dark:text-white">{progress.progress}% complete</p>
          <p className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
            {progress.completed} of {progress.total} sets completed
          </p>
        </div>
        <div className="mt-2"><ProgressBar value={progress.progress} /></div>
        <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{progress.message}</p>
        <p className="mt-1 text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
          Attempted {progress.attempted}. Best {progress.bestScore}%. Average {progress.averageScore}%.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {progress.categoryCounts.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="metric-number mt-1 text-lg">{item.count}</p>
          </div>
        ))}
      </div>

      {nextQuiz ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
          Next: {nextQuiz.label}
        </p>
      ) : null}

      <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
        {progress.quizzes.map((quiz) => (
          <div key={quiz.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{quiz.label}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <StateIcon state={quiz.state} />
              {stateLabels[quiz.state]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {primaryStage ? (
          <Link
            to={primaryStage.path}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-bold text-white transition hover:bg-teal-600 dark:bg-teal-400 dark:text-slate-950"
          >
            Warm up <ArrowRight size={16} />
          </Link>
        ) : null}
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
