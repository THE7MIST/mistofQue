import { AlertTriangle, BarChart3, BookOpenCheck, Clock3, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BadgeCard from "../components/BadgeCard.jsx";
import SubjectProgressCard from "../components/SubjectProgressCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { subjects } from "../data/subjects.js";
import { getLocalResults } from "../services/resultsService.js";
import { buildProgressModel, calculateBadges } from "../utils/progress.js";
import { formatDuration, formatShortDate } from "../utils/time.js";

function averageScore(results) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [badges, setBadges] = useState([]);
  const results = getLocalResults(user.email);
  const resultSignature = useMemo(() => results.map((result) => `${result.id}:${result.score}`).join("|"), [results]);
  const recentResults = results.slice(0, 5);
  const latestResult = recentResults[0];
  const bestScore = results.reduce((best, result) => Math.max(best, result.score), 0);
  const totalTime = results.reduce((sum, result) => sum + result.elapsedSeconds, 0);
  const overallTotal = subjectProgress.reduce((sum, item) => sum + item.total, 0);
  const overallCompleted = subjectProgress.reduce((sum, item) => sum + item.completed, 0);
  const overallProgress = overallTotal ? Math.round((overallCompleted / overallTotal) * 100) : 0;
  const nextSubject = subjectProgress.find((item) => item.total > item.completed) || subjectProgress[0];
  const nextQuiz = nextSubject?.quizzes?.find((quiz) => quiz.state === "not-started") || nextSubject?.quizzes?.[0];

  const weakAreas = useMemo(() => {
    const counts = new Map();
    results.flatMap((result) => result.weakAreas || []).forEach((area) => {
      counts.set(area.name, (counts.get(area.name) || 0) + (area.count || 1));
    });
    return [...counts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 4).map(([name, count]) => ({ name, count }));
  }, [results]);

  useEffect(() => {
    let ignore = false;

    buildProgressModel(subjects, results).then((progress) => {
      if (ignore) return;
      setSubjectProgress(progress);
      setBadges(calculateBadges({ results, subjectProgress: progress, userEmail: user.email }));
    });

    return () => {
      ignore = true;
    };
  }, [resultSignature, user.email]);

  return (
    <>
      <PageHeader
        eyebrow="Candidate dashboard"
        title={`Welcome, ${user.name || "Candidate"}`}
        description="Pick a subject, continue stage practice, or review your latest performance trends."
      />

      <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Notice: Some answer keys may contain mistakes. If you find a wrong answer, report it so it can be corrected.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="glass-panel rounded-lg p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Study command center</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {overallCompleted} of {overallTotal || 0} available sets completed
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                Progress updates automatically as subjects and topic sets are added. Scores and badges are calculated from saved attempts.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Overall</p>
              <p className="metric-number mt-1 text-4xl">{overallProgress}%</p>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={overallProgress} label="Total learning progress" />
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5">
          <p className="eyebrow">Continue learning</p>
          {nextSubject && nextQuiz ? (
            <>
              <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{nextSubject.subject.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{nextQuiz.label}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={nextQuiz.quizType === "topic" ? nextSubject.subject.topicsPath : nextSubject.subject.stages.find((stage) => stage.slug === nextQuiz.stageSlug)?.path || nextSubject.subject.topicsPath}
                  className="focus-ring inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-black text-white transition hover:bg-teal-600 dark:bg-teal-400 dark:text-slate-950"
                >
                  Continue
                </Link>
                <Link
                  to="/analytics"
                  className="focus-ring inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  Review analytics
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Start any warm-up set to begin tracking progress.</p>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={results.length} icon={BookOpenCheck} detail="Saved on this device" tone="teal" />
        <StatCard label="Average" value={`${averageScore(results)}%`} icon={Target} detail="Across completed tests" tone="amber" />
        <StatCard label="Best Score" value={`${bestScore}%`} icon={BarChart3} detail="Highest result" tone="emerald" />
        <StatCard label="Practice Time" value={formatDuration(totalTime)} icon={Clock3} detail="Total focused time" tone="teal" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <SectionHeader
            eyebrow="Subject progress"
            title="Practice map"
            description="Completion, best scores, and next actions for every configured subject."
            action={<Link to="/analytics" className="text-sm font-black text-teal-700 hover:text-teal-600 dark:text-teal-300">
              Analytics
            </Link>}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {subjectProgress.length ? (
              subjectProgress.map((progress) => <SubjectProgressCard key={progress.subject.slug} progress={progress} />)
            ) : (
              <EmptyState title="Loading progress" description="Reading subject indexes and saved results." className="md:col-span-2" />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <SectionHeader eyebrow="Milestones" title="Badges" description="Earned from saved result history." />
            <div className="mt-4 grid gap-3">
              {badges.length ? badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />) : (
                <EmptyState title="Loading badges" description="Milestones appear after progress is calculated." />
              )}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <SectionHeader eyebrow="Recent work" title="Latest attempts" />
            <div className="mt-4 space-y-3">
              {recentResults.length ? (
                recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-teal-300 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{result.subject}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{result.stage}</p>
                      </div>
                      <StatusBadge tone={result.score >= 85 ? "success" : result.score >= 60 ? "accent" : "warning"}>{result.score}%</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{formatShortDate(result.completedAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No attempts yet" description="Complete a quiz to see your latest score here." />
              )}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <SectionHeader eyebrow="Weak-area watch" title="Priority review" />
            {weakAreas.length ? (
              <div className="space-y-2">
                {weakAreas.map((area) => (
                  <div key={area.name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{area.name}</span>
                    <StatusBadge tone="danger">{area.count}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No weak areas yet" description={latestResult ? "Your latest attempt did not record weak areas." : "Weak topics appear after submitted quizzes."} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
