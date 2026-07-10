import { AlertTriangle, Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionPalette from "../components/QuestionPalette.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getStage, getSubject } from "../data/subjects.js";
import { useQuizSession } from "../hooks/useQuizSession.js";
import { loadQuizFile } from "../services/quizService.js";
import { saveResult } from "../services/resultsService.js";
import { formatDuration } from "../utils/time.js";

function resolveQuizFile({ quizType, subjectSlug, stageSlug, setSlug }) {
  if (quizType === "topic") return `/data/${subjectSlug}/topics/${setSlug}.json`;
  return getStage(subjectSlug, stageSlug)?.file;
}

function QuizSession({ quiz, attemptKey }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const submittedRef = useRef(false);
  const session = useQuizSession({ quiz, attemptKey });
  const {
    questions,
    currentQuestion,
    currentIndex,
    answers,
    bookmarks,
    reviewLater,
    timeLeft,
    elapsedSeconds,
    answeredCount,
    unansweredCount,
    progress,
    selectAnswer,
    goTo,
    goNext,
    goPrevious,
    toggleBookmark,
    toggleReviewLater,
    resetAttempt,
    clearAttempt,
    getResult
  } = session;

  const submitQuiz = useCallback((reason = "manual") => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const result = {
      ...getResult(),
      submitReason: reason
    };

    clearAttempt();
    saveResult(result, user).catch((error) => {
      console.warn("Result saved locally but remote sync failed.", error);
    });
    navigate("/results", { state: { result } });
  }, [clearAttempt, getResult, navigate, user]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length) {
      submitQuiz("timeout");
    }
  }, [timeLeft, questions.length, submitQuiz]);

  const selectedAnswer = answers[currentQuestion.id];
  const isBookmarked = bookmarks.has(currentQuestion.id);
  const isReviewLater = reviewLater.has(currentQuestion.id);

  return (
    <>
      <PageHeader
        eyebrow={`${quiz.subject} / ${quiz.stage || quiz.topic}`}
        title={quiz.title}
        description={`${questions.length} randomized questions. Answers are saved during the active attempt.`}
        actions={
          <>
            <Button variant="secondary" onClick={resetAttempt}>
              <RotateCcw size={17} />
              Restart
            </Button>
            <Button onClick={() => submitQuiz("manual")}>
              <CheckCircle2 size={17} />
              Submit
            </Button>
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="glass-panel rounded-lg p-4 sm:p-6">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <ProgressBar value={progress} label={`${answeredCount}/${questions.length} answered`} />
            <div className="flex flex-wrap gap-2 md:justify-end">
              <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <Clock3 size={17} />
                {formatDuration(timeLeft)}
              </span>
              <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500/14 px-3 text-sm font-bold text-amber-700 dark:text-amber-200">
                <AlertTriangle size={17} />
                {unansweredCount} left
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <h2 className="mt-3 text-xl font-bold leading-8 text-slate-950 dark:text-white">{currentQuestion.question}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  className={`focus-ring inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                    isBookmarked
                      ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-300/30 dark:bg-amber-400/15 dark:text-amber-200"
                      : "border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  <Bookmark size={17} />
                  Bookmark
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, optionIndex)}
                    className={`focus-ring flex min-h-14 w-full items-center gap-3 rounded-lg border p-3 text-left text-sm font-semibold transition sm:p-4 ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-900 shadow-sm dark:bg-teal-400/12 dark:text-teal-100"
                        : "border-slate-200 bg-white/70 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${
                        isSelected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant={isReviewLater ? "danger" : "secondary"} onClick={() => toggleReviewLater(currentQuestion.id)}>
              Review later
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={goPrevious} disabled={currentIndex === 0}>
                <ChevronLeft size={17} />
                Previous
              </Button>
              <Button onClick={goNext} disabled={currentIndex === questions.length - 1}>
                Next
                <ChevronRight size={17} />
              </Button>
            </div>
          </div>
        </div>

        <aside className="glass-panel h-fit rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Question palette</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Jump to any item</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {formatDuration(elapsedSeconds)}
            </span>
          </div>
          <QuestionPalette
            questions={questions}
            answers={answers}
            bookmarks={bookmarks}
            reviewLater={reviewLater}
            currentIndex={currentIndex}
            onJump={goTo}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="rounded-lg bg-emerald-500/10 px-2 py-2 text-emerald-700 dark:text-emerald-200">Answered</span>
            <span className="rounded-lg bg-amber-500/14 px-2 py-2 text-amber-700 dark:text-amber-200">Marked</span>
          </div>
        </aside>
      </section>
    </>
  );
}

export default function QuizPage({ quizType }) {
  const { subjectSlug, stageSlug, setSlug } = useParams();
  const subject = getSubject(subjectSlug);
  const file = resolveQuizFile({ quizType, subjectSlug, stageSlug, setSlug });
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;
    setStatus("loading");

    if (!subject || !file) {
      setStatus("error");
      return () => {
        ignore = true;
      };
    }

    loadQuizFile(file)
      .then((data) => {
        if (!ignore) {
          setQuiz({
            ...data,
            subjectSlug,
            subject: data.subject || subject.name
          });
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [file, subject, subjectSlug]);

  if (status === "loading") {
    return <PageHeader eyebrow="Practice" title="Loading MCQ set" description="Preparing randomized questions..." />;
  }

  if (status === "error" || !quiz) {
    return <PageHeader eyebrow="Practice" title="MCQ set unavailable" description="Choose another stage or topic from the sidebar." />;
  }

  const attemptKey = quizType === "topic" ? `${subjectSlug}_topic_${setSlug}` : `${subjectSlug}_stage_${stageSlug}`;

  return <QuizSession key={attemptKey} quiz={quiz} attemptKey={attemptKey} />;
}
