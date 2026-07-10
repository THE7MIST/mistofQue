import { shuffleArray } from "./shuffle.js";

function safeUuid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function randomizeQuestions(questions = []) {
  return shuffleArray(questions).map((question, questionIndex) => {
    const options = question.options.map((option, optionIndex) => ({
      text: option,
      originalIndex: optionIndex
    }));
    const shuffledOptions = shuffleArray(options);

    return {
      ...question,
      attemptOrder: questionIndex,
      options: shuffledOptions.map((option) => option.text),
      correctOptionIndex: shuffledOptions.findIndex((option) => option.originalIndex === question.correct)
    };
  });
}

export function calculateResult({ quiz, questions, answers, elapsedSeconds }) {
  const review = questions.map((question) => {
    const userAnswerIndex = answers[question.id];
    const isAnswered = Number.isInteger(userAnswerIndex);
    const isCorrect = isAnswered && userAnswerIndex === question.correctOptionIndex;

    return {
      id: question.id,
      question: question.question,
      options: question.options,
      userAnswerIndex: isAnswered ? userAnswerIndex : null,
      userAnswer: isAnswered ? question.options[userAnswerIndex] : "Unattempted",
      correctAnswerIndex: question.correctOptionIndex,
      correctAnswer: question.options[question.correctOptionIndex],
      description: question.description,
      difficulty: question.difficulty || "Standard",
      tags: question.tags || [],
      topic: question.topic || quiz.topic || quiz.stage,
      isCorrect,
      isAnswered
    };
  });

  const totalQuestions = review.length;
  const correct = review.filter((item) => item.isCorrect).length;
  const unattempted = review.filter((item) => !item.isAnswered).length;
  const wrong = totalQuestions - correct - unattempted;
  const score = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
  const weakAreaCounts = new Map();

  review
    .filter((item) => !item.isCorrect)
    .flatMap((item) => (item.tags?.length ? item.tags : [item.topic]))
    .filter(Boolean)
    .forEach((tag) => weakAreaCounts.set(tag, (weakAreaCounts.get(tag) || 0) + 1));

  const weakAreas = [...weakAreaCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    id: safeUuid(),
    subjectSlug: quiz.subjectSlug,
    subject: quiz.subject,
    title: quiz.title,
    stage: quiz.stage || quiz.topic || "Practice",
    score,
    totalQuestions,
    correct,
    wrong,
    unattempted,
    elapsedSeconds,
    completedAt: new Date().toISOString(),
    weakAreas,
    review
  };
}
