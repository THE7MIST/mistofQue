export default function ResultReviewItem({ item, index }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
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
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200"
              : item.isAnswered
                ? "bg-rose-500/12 text-rose-700 dark:text-rose-200"
                : "bg-amber-500/14 text-amber-700 dark:text-amber-200"
          }`}
        >
          {item.isCorrect ? "Correct" : item.isAnswered ? "Wrong" : "Unattempted"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-100/80 p-3 text-sm dark:bg-white/5">
          <p className="font-semibold text-slate-500 dark:text-slate-400">Your answer</p>
          <p className="mt-1 text-slate-900 dark:text-slate-100">{item.userAnswer}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-400/10">
          <p className="font-semibold text-emerald-700 dark:text-emerald-200">Correct answer</p>
          <p className="mt-1 text-slate-900 dark:text-slate-100">{item.correctAnswer}</p>
        </div>
      </div>

      {item.description ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p> : null}
    </article>
  );
}
