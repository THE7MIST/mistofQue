import { AlertTriangle, Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionPalette from "../components/QuestionPalette.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import { isDemoUser, useAuth } from "../context/AuthContext.jsx";
import { useFocusMode } from "../context/FocusModeContext.jsx";
import { getStage, getSubject } from "../data/subjects.js";
import { useQuizSession } from "../hooks/useQuizSession.js";
import { loadQuizFile } from "../services/quizService.js";
import { saveResult } from "../services/resultsService.js";
import { formatDuration } from "../utils/time.js";

const LEAVE_WARNING = "You have an active quiz.\nLeaving now may lose your progress.";

function resolveQuizFile({ quizType, subjectSlug, stageSlug, setSlug }) {
  if (quizType === "topic") return `/data/${subjectSlug}/topics/${setSlug}.json`;
  return getStage(subjectSlug, stageSlug)?.file;
}

function SubmitConfirmModal({ answeredCount, unansweredCount, timeLeft, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-quiz-title"
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950"
      >
        <h2 id="submit-quiz-title" className="text-xl font-black text-slate-950 dark:text-white">
          Submit Quiz?
        </h2>
        <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span>Answered</span>
            <span className="text-slate-950 dark:text-white">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span>Unanswered</span>
            <span className="text-slate-950 dark:text-white">{unansweredCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span>Time Left</span>
            <span className="text-slate-950 dark:text-white">{formatDuration(timeLeft)}</span>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-amber-300/60 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100">
          Once submitted you cannot change answers.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 size={17} />
            Submit
          </Button>
        </div>
      </section>
    </div>
  );
}

function DemoBlockedQuiz({ quiz }) {
  return (
    <>
      <PageHeader
        eyebrow={`${quiz.subject} / ${quiz.stage || quiz.topic}`}
        title={quiz.title}
        description="Demo account access is read-only for real quizzes."
      />
      <section className="glass-panel rounded-lg p-6">
        <div className="flex max-w-xl gap-3">
          <AlertTriangle className="mt-1 text-amber-500" size={24} />
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Demo Account</h2>
            <p className="mt-2 font-semibold text-slate-600 dark:text-slate-300">
              This quiz is available only for registered users.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function QuizStartScreen({ quiz, onStart, onStartFocus }) {
  return (
    <>
      <PageHeader
        eyebrow={`${quiz.subject} / ${quiz.stage || quiz.topic}`}
        title={quiz.title}
        description={`${quiz.questions.length} randomized questions. Choose a normal attempt or a distraction-free attempt.`}
      />
      <section className="glass-panel rounded-lg p-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Ready to begin?</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            The timer starts only after you choose a mode. Your active attempt will continue from this device until submitted or restarted.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onStart}>
              Start Quiz
            </Button>
            <Button size="lg" variant="secondary" onClick={onStartFocus}>
              Start Focus Mode
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function ActiveQuizSession({ quiz, attemptKey }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFocusMode, exitFocusMode } = useFocusMode();
  const submittedRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
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
    clearAnswer,
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
    allowLeaveRef.current = true;
    setShowSubmitConfirm(false);

    const result = {
      ...getResult(),
      submitReason: reason
    };

    clearAttempt();
    saveResult(result, user).catch((error) => {
      console.warn("Result saved locally but remote sync failed.", error);
    });
    exitFocusMode();
    navigate("/results", { state: { result } });
  }, [clearAttempt, exitFocusMode, getResult, navigate, user]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length) {
      submitQuiz("timeout");
    }
  }, [timeLeft, questions.length, submitQuiz]);

  const confirmLeave = useCallback(() => window.confirm(LEAVE_WARNING), []);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (submittedRef.current || allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = LEAVE_WARNING;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      if (submittedRef.current || allowLeaveRef.current) return;
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage = url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash === currentUrl.hash;
      if (url.origin !== currentUrl.origin || isSamePage) return;

      if (!confirmLeave()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        allowLeaveRef.current = true;
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [confirmLeave]);

  useEffect(() => {
    window.history.pushState({ mcqArenaQuizGuard: true }, "", window.location.href);

    const onPopState = () => {
      if (submittedRef.current || allowLeaveRef.current) return;

      if (confirmLeave()) {
        allowLeaveRef.current = true;
        window.setTimeout(() => window.history.back(), 0);
      } else {
        window.history.pushState({ mcqArenaQuizGuard: true }, "", window.location.href);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [confirmLeave]);

  const handleRestart = useCallback(() => {
    const confirmed = window.confirm(
      "Restart this quiz? Your current answers, bookmarks, review marks, timer, and shuffled question order for this active attempt will be erased. Previous submitted results and dashboard progress will stay saved."
    );

    if (confirmed) resetAttempt();
  }, [resetAttempt]);

  if (!currentQuestion) {
    return <PageHeader eyebrow="Practice" title="No questions available" description="Choose another stage or topic from the sidebar." />;
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isBookmarked = bookmarks.has(currentQuestion.id);
  const isReviewLater = reviewLater.has(currentQuestion.id);
  const openSubmitConfirm = () => setShowSubmitConfirm(true);

  return (
    <>
      {isFocusMode ? (
        <>
          <button
            type="button"
            onClick={exitFocusMode}
            className="focus-ring fixed right-4 top-4 z-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 shadow-lg dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            Exit Focus Mode
          </button>
          <section className="mb-4 rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                <Clock3 size={17} />
                {formatDuration(timeLeft)}
              </span>
            </div>
            <div className="mt-4">
              <ProgressBar value={progress} label={`${answeredCount}/${questions.length} answered`} />
            </div>
          </section>
        </>
      ) : (
        <PageHeader
          eyebrow={`${quiz.subject} / ${quiz.stage || quiz.topic}`}
          title={quiz.title}
          description={`${questions.length} randomized questions. Answers are saved during the active attempt.`}
          actions={
            <>
              <Button variant="secondary" onClick={handleRestart} title="Restart clears only this active attempt">
                <RotateCcw size={17} />
                Restart
              </Button>
              <Button onClick={openSubmitConfirm}>
                <CheckCircle2 size={17} />
                Submit
              </Button>
            </>
          }
        />
      )}

      <section className={isFocusMode ? "mx-auto max-w-4xl" : "grid gap-6 xl:grid-cols-[1fr_20rem]"}>
        <div className="glass-panel rounded-lg p-4 sm:p-6">
          {!isFocusMode && (
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
          )}

          <div className="rounded-lg border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <h2 className="mt-3 text-xl font-bold leading-8 text-slate-950 dark:text-white">{currentQuestion.question}</h2>
              </div>
              {!isFocusMode && (
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
              )}
            </div>

            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;

                return (
                  <button
                    key={`${currentQuestion.id}-${optionIndex}`}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, optionIndex)}
                    className={`focus-ring flex min-h-14 w-full items-center gap-3 rounded-lg border p-3 text-left text-sm font-semibold transition sm:p-4 ${
                      isSelected
                        ? "border-teal-600 bg-teal-50 text-teal-950 shadow-sm dark:border-teal-300 dark:bg-teal-400/25 dark:text-white dark:shadow-[0_0_0_1px_rgba(94,234,212,0.35)]"
                        : "border-slate-200 bg-white/70 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:border-teal-300/60 dark:hover:bg-teal-400/10"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${
                        isSelected
                          ? "bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950"
                          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {!isFocusMode && Number.isInteger(selectedAnswer) && (
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={() => clearAnswer(currentQuestion.id)}>
                  Clear Answer
                </Button>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {!isFocusMode && (
              <Button variant={isReviewLater ? "danger" : "secondary"} onClick={() => toggleReviewLater(currentQuestion.id)}>
                Review later
              </Button>
            )}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Button variant="secondary" onClick={goPrevious} disabled={currentIndex === 0}>
                <ChevronLeft size={17} />
                Previous
              </Button>
              <Button onClick={goNext} disabled={currentIndex === questions.length - 1}>
                Next
                <ChevronRight size={17} />
              </Button>
              {isFocusMode && (
                <Button onClick={openSubmitConfirm}>
                  <CheckCircle2 size={17} />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isFocusMode && (
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
        )}
      </section>

      {showSubmitConfirm && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          timeLeft={timeLeft}
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={() => submitQuiz("manual")}
        />
      )}
    </>
  );
}

function QuizSession({ quiz, attemptKey }) {
  const { user } = useAuth();
  const { enterFocusMode, exitFocusMode } = useFocusMode();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => () => exitFocusMode(), [exitFocusMode]);

  if (isDemoUser(user) && !quiz.demo) {
    return <DemoBlockedQuiz quiz={quiz} />;
  }

  if (!hasStarted) {
    return (
      <QuizStartScreen
        quiz={quiz}
        onStart={() => {
          exitFocusMode();
          setHasStarted(true);
        }}
        onStartFocus={() => {
          enterFocusMode();
          setHasStarted(true);
        }}
      />
    );
  }

  return <ActiveQuizSession quiz={quiz} attemptKey={attemptKey} />;
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
            subject: data.subject || subject.name,
            quizType,
            stageSlug,
            setSlug,
            quizKey: quizType === "topic" ? `${subjectSlug}:topic:${setSlug}` : `${subjectSlug}:stage:${stageSlug}`
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
  }, [file, quizType, setSlug, stageSlug, subject, subjectSlug]);

  if (status === "loading") {
    return <PageHeader eyebrow="Practice" title="Loading MCQ set" description="Preparing randomized questions..." />;
  }

  if (status === "error" || !quiz) {
    return <PageHeader eyebrow="Practice" title="MCQ set unavailable" description="Choose another stage or topic from the sidebar." />;
  }

  const attemptKey = quizType === "topic" ? `${subjectSlug}_topic_${setSlug}` : `${subjectSlug}_stage_${stageSlug}`;

  return <QuizSession key={attemptKey} quiz={quiz} attemptKey={attemptKey} />;
}
