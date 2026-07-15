export default function ResultReviewItem({ item, index }) {
  const stateClasses = item.isCorrect
    ? "border-emerald-300/70 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-400/10"
    : item.isAnswered
      ? "border-rose-300/70 bg-rose-50/70 dark:border-rose-400/25 dark:bg-rose-400/10"
      : "border-amber-300/70 bg-amber-50/70 dark:border-amber-400/25 dark:bg-amber-400/10";

  return (
    <article className={`rounded-lg border p-4 ${stateClasses}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Question {index + 1}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950 dark:text-white">{item.question}</h3>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
            item.isCorrect
              ? "bg-emerald-500/12 text-emerald-800 dark:text-emerald-100"
              : item.isAnswered
                ? "bg-rose-500/12 text-rose-800 dark:text-rose-100"
                : "bg-amber-500/14 text-amber-800 dark:text-amber-100"
          }`}
        >
          {item.isCorrect ? "Correct" : item.isAnswered ? "Wrong" : "Unattempted"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-500 dark:text-slate-400">Your answer</p>
          <p className="mt-1 text-slate-900 dark:text-slate-100">{item.userAnswer}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-3 text-sm dark:border-emerald-400/20 dark:bg-slate-950/40">
          <p className="font-semibold text-emerald-700 dark:text-emerald-200">Correct answer</p>
          <p className="mt-1 text-slate-900 dark:text-slate-100">{item.correctAnswer}</p>
        </div>
      </div>

      {item.description ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p> : null}
    </article>
  );
}
