import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateResult, randomizeQuestions } from "../utils/quiz.js";

function safeUuid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createAttempt(quiz, durationSeconds) {
  return {
    id: safeUuid(),
    quizVersion: quiz.version || "1",
    questions: randomizeQuestions(quiz.questions),
    answers: {},
    bookmarks: [],
    reviewLater: [],
    currentIndex: 0,
    startedAt: Date.now(),
    durationSeconds
  };
}

function readAttempt(key, quiz, durationSeconds) {
  try {
    const savedAttempt = JSON.parse(localStorage.getItem(key));
    if (savedAttempt?.questions?.length && savedAttempt.quizVersion === (quiz.version || "1")) {
      return savedAttempt;
    }
  } catch {
    return null;
  }

  return createAttempt(quiz, durationSeconds);
}

export function useQuizSession({ quiz, attemptKey }) {
  const durationSeconds = (quiz.durationMinutes || Number(import.meta.env.VITE_DEFAULT_QUIZ_MINUTES) || 15) * 60;
  const storageKey = `mcq_arena_attempt_${attemptKey}`;
  const [attempt, setAttempt] = useState(() => readAttempt(storageKey, quiz, durationSeconds));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(attempt));
  }, [attempt, storageKey]);

  const questions = attempt.questions;
  const currentQuestion = questions[attempt.currentIndex];
  const bookmarks = useMemo(() => new Set(attempt.bookmarks), [attempt.bookmarks]);
  const reviewLater = useMemo(() => new Set(attempt.reviewLater), [attempt.reviewLater]);
  const elapsedSeconds = Math.min(durationSeconds, Math.floor((now - attempt.startedAt) / 1000));
  const timeLeft = Math.max(0, durationSeconds - elapsedSeconds);
  const answeredCount = questions.filter((question) => Number.isInteger(attempt.answers[question.id])).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const selectAnswer = useCallback((questionId, optionIndex) => {
    setAttempt((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [questionId]: optionIndex
      }
    }));
  }, []);

  const goTo = useCallback((index) => {
    setAttempt((current) => ({
      ...current,
      currentIndex: Math.min(Math.max(index, 0), current.questions.length - 1)
    }));
  }, []);

  const goNext = useCallback(() => {
    setAttempt((current) => ({
      ...current,
      currentIndex: Math.min(current.currentIndex + 1, current.questions.length - 1)
    }));
  }, []);

  const goPrevious = useCallback(() => {
    setAttempt((current) => ({
      ...current,
      currentIndex: Math.max(current.currentIndex - 1, 0)
    }));
  }, []);

  const toggleListValue = useCallback((field, questionId) => {
    setAttempt((current) => {
      const next = new Set(current[field]);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return { ...current, [field]: [...next] };
    });
  }, []);

  const resetAttempt = useCallback(() => {
    const nextAttempt = createAttempt(quiz, durationSeconds);
    localStorage.setItem(storageKey, JSON.stringify(nextAttempt));
    setAttempt(nextAttempt);
    setNow(Date.now());
  }, [durationSeconds, quiz, storageKey]);

  const clearAttempt = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getResult = useCallback(
    () =>
      calculateResult({
        quiz,
        questions,
        answers: attempt.answers,
        elapsedSeconds
      }),
    [attempt.answers, elapsedSeconds, questions, quiz]
  );

  return {
    questions,
    currentQuestion,
    currentIndex: attempt.currentIndex,
    answers: attempt.answers,
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
    toggleBookmark: (questionId) => toggleListValue("bookmarks", questionId),
    toggleReviewLater: (questionId) => toggleListValue("reviewLater", questionId),
    resetAttempt,
    clearAttempt,
    getResult
  };
}
