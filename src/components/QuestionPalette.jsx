export default function QuestionPalette({
  questions,
  answers,
  bookmarks,
  reviewLater,
  currentIndex,
  onJump
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
      {questions.map((question, index) => {
        const answered = Number.isInteger(answers[question.id]);
        const marked = bookmarks.has(question.id) || reviewLater.has(question.id);
        const active = index === currentIndex;

        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onJump(index)}
            className={`focus-ring relative h-10 rounded-lg border text-sm font-bold transition ${
              active
                ? "border-teal-500 bg-teal-500 text-white"
                : answered
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
                  : "border-slate-200 bg-white/70 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            }`}
            aria-label={`Question ${index + 1}`}
          >
            {index + 1}
            {marked ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
