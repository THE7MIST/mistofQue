import { badgeDefinitions } from "../data/badges.js";
import { loadQuizFile, loadTopicIndex } from "../services/quizService.js";

const BADGE_KEY = "mcq_arena_earned_badges";

function readEarnedBadgeIds(userEmail) {
  try {
    const data = JSON.parse(localStorage.getItem(BADGE_KEY)) || {};
    return new Set(data[userEmail] || []);
  } catch {
    return new Set();
  }
}

function writeEarnedBadgeIds(userEmail, ids) {
  try {
    const data = JSON.parse(localStorage.getItem(BADGE_KEY)) || {};
    data[userEmail] = [...ids];
    localStorage.setItem(BADGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures; badges still render from current results.
  }
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function subjectAliases(subject) {
  return [subject.slug, subject.name, subject.shortName].map(normalize).filter(Boolean);
}

function resultBelongsToSubject(result, subject) {
  const aliases = subjectAliases(subject);
  return aliases.includes(normalize(result.subjectSlug)) || aliases.includes(normalize(result.subject));
}

function getResultQuizKey(result) {
  if (result.quizKey) return result.quizKey;
  if (result.subjectSlug && result.quizType === "stage" && result.stageSlug) return `${result.subjectSlug}:stage:${result.stageSlug}`;
  if (result.subjectSlug && result.quizType === "topic" && result.setSlug) return `${result.subjectSlug}:topic:${result.setSlug}`;
  return "";
}

function getLegacyMatch(result, quiz) {
  const stage = normalize(result.stage);
  const title = normalize(result.title);

  if (quiz.quizType === "stage") {
    return stage === normalize(quiz.label) || stage === normalize(quiz.title) || title === normalize(quiz.title);
  }

  return title && (title === normalize(quiz.title) || title === normalize(quiz.label));
}

function getDirectMatch(result, quiz) {
  const key = getResultQuizKey(result);
  if (key) return key === quiz.id;
  return getLegacyMatch(result, quiz);
}

function isLegacyTopicResult(result) {
  if (getResultQuizKey(result)) return false;
  const stage = normalize(result.stage);
  return !normalize(result.title) && (stage.includes("topic") || stage === "practice");
}

function getResultToken(result, index) {
  return result.id || `${result.completedAt || "legacy"}-${index}`;
}

function mapResultsToQuizzes(results, subject, quizzes) {
  const subjectResults = results.filter((result) => resultBelongsToSubject(result, subject));
  const matches = new Map(quizzes.map((quiz) => [quiz.id, []]));
  const matchedTokens = new Set();

  subjectResults.forEach((result, index) => {
    const token = getResultToken(result, index);
    const quiz = quizzes.find((item) => getDirectMatch(result, item));
    if (!quiz) return;
    matches.get(quiz.id).push(result);
    matchedTokens.add(token);
  });

  const availableTopicQuizzes = quizzes.filter((quiz) => quiz.quizType === "topic" && !matches.get(quiz.id)?.length);
  const legacyTopicResults = subjectResults.filter((result, index) => !matchedTokens.has(getResultToken(result, index)) && isLegacyTopicResult(result));

  legacyTopicResults.slice(0, availableTopicQuizzes.length).forEach((result, index) => {
    matches.get(availableTopicQuizzes[index].id).push(result);
  });

  return { matches, subjectResults };
}

function getQuizState(bestScore, attempts) {
  if (!attempts) return "not-started";
  if (bestScore >= 85) return "mastered";
  if (bestScore >= 60) return "completed";
  return "attempted";
}

export function getProgressMessage(progress, isMastered) {
  if (isMastered) return "Subject mastered. Outstanding performance.";
  if (progress === 0) return "Start your first set and begin the journey.";
  if (progress < 25) return "Good start. Keep building momentum.";
  if (progress < 50) return "You're making progress. Keep going.";
  if (progress < 75) return "Halfway there. Stay consistent.";
  if (progress < 100) return "Almost complete. Finish strong.";
  return "Subject completed. Excellent work.";
}

async function getQuestionCount(file) {
  try {
    const quiz = await loadQuizFile(file);
    return quiz.questions?.length || 0;
  } catch {
    return 0;
  }
}

export async function discoverSubjectQuizzes(subject) {
  const stageQuizzes = await Promise.all(
    subject.stages.map(async (stage) => ({
      id: `${subject.slug}:stage:${stage.slug}`,
      quizType: "stage",
      subjectSlug: subject.slug,
      stageSlug: stage.slug,
      title: stage.label,
      label: stage.label,
      group: stage.label,
      file: stage.file,
      questionCount: await getQuestionCount(stage.file)
    }))
  );

  let topicQuizzes = [];
  try {
    const topicIndex = await loadTopicIndex(subject.topicIndexFile);
    topicQuizzes = await Promise.all(
      (topicIndex.sets || []).map(async (set) => {
        const file = `/data/${subject.slug}/topics/${set.slug}.json`;
        return {
          id: `${subject.slug}:topic:${set.slug}`,
          quizType: "topic",
          subjectSlug: subject.slug,
          setSlug: set.slug,
          title: set.topic,
          label: `${set.setNumber} - ${set.topic}`,
          group: "Topic Wise MCQ",
          file,
          questionCount: await getQuestionCount(file)
        };
      })
    );
  } catch {
    topicQuizzes = [];
  }

  return [...stageQuizzes, ...topicQuizzes];
}

export async function buildProgressModel(subjects, results) {
  const subjectProgress = await Promise.all(
    subjects.map(async (subject) => {
      const quizzes = await discoverSubjectQuizzes(subject);
      const { matches, subjectResults } = mapResultsToQuizzes(results, subject, quizzes);
      const quizStates = quizzes.map((quiz) => {
        const attempts = matches.get(quiz.id) || [];
        const bestScore = attempts.reduce((best, result) => Math.max(best, Number(result.score || 0)), 0);
        return {
          ...quiz,
          attempts: attempts.length,
          bestScore,
          state: getQuizState(bestScore, attempts.length)
        };
      });

      const total = quizStates.length;
      const attempted = quizStates.filter((quiz) => quiz.attempts > 0).length;
      const mastered = quizStates.filter((quiz) => quiz.state === "mastered").length;
      const completed = attempted;
      const progress = percent(completed, total);
      const bestScore = subjectResults.reduce((best, result) => Math.max(best, Number(result.score || 0)), 0);
      const averageScore = subjectResults.length
        ? Math.round(subjectResults.reduce((sum, result) => sum + Number(result.score || 0), 0) / subjectResults.length)
        : 0;
      const categoryCounts = ["Warm Up MCQ", "Topic Wise MCQ", "Quarter Final", "Semi Final", "Final Boss"].map((label) => ({
        label,
        count: quizStates.filter((quiz) => quiz.group === label).reduce((sum, quiz) => sum + quiz.questionCount, 0)
      }));

      return {
        subject,
        quizzes: quizStates,
        total,
        attempted,
        completed,
        mastered,
        progress,
        bestScore,
        averageScore,
        isFinished: total > 0 && completed === total,
        isMastered: total > 0 && mastered === total,
        message: getProgressMessage(progress, total > 0 && mastered === total),
        categoryCounts
      };
    })
  );

  return subjectProgress;
}

export function calculateBadges({ results, subjectProgress, userEmail }) {
  const earnedIds = readEarnedBadgeIds(userEmail);
  const completedResults = results.length;
  const winningResults = results.filter((result) => Number(result.score || 0) >= 60).length;
  const highScores = results.filter((result) => Number(result.score || 0) >= 85).length;
  const perfectScores = results.filter((result) => Number(result.score || 0) === 100).length;
  const exploredSubjects = subjectProgress.filter(({ subject }) => results.some((result) => resultBelongsToSubject(result, subject))).length;
  const finishedSubjects = subjectProgress.filter((subject) => subject.isFinished).length;
  const masteredSubjects = subjectProgress.filter((subject) => subject.isMastered).length;
  const totalQuizzes = subjectProgress.reduce((sum, subject) => sum + subject.total, 0);
  const completedQuizzes = subjectProgress.reduce((sum, subject) => sum + subject.completed, 0);

  const progressById = {
    "first-attempt": completedResults,
    "first-win": winningResults,
    "high-scorer": highScores,
    "perfect-score": perfectScores,
    "consistent-learner": completedResults,
    "quiz-explorer": exploredSubjects,
    "subject-finisher": finishedSubjects,
    "subject-master": masteredSubjects,
    "knowledge-hunter": completedResults,
    "mcq-champion": totalQuizzes > 0 && completedQuizzes === totalQuizzes ? 1 : 0
  };

  const badges = badgeDefinitions.map((badge) => {
    const stored = badge.type === "milestone" && earnedIds.has(badge.id);
    const current = stored ? badge.target : Math.min(progressById[badge.id] || 0, badge.target);
    const earnedNow = current >= badge.target;
    const earned = badge.type === "milestone" ? stored || earnedNow : earnedNow;
    if (badge.type === "milestone" && earnedNow) earnedIds.add(badge.id);
    return {
      ...badge,
      current,
      earned,
      progress: percent(current, badge.target)
    };
  });

  writeEarnedBadgeIds(userEmail, earnedIds);
  return badges;
}
