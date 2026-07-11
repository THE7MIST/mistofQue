import { AlertTriangle, BarChart3, BookOpenCheck, Clock3, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BadgeCard from "../components/BadgeCard.jsx";
import SubjectProgressCard from "../components/SubjectProgressCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
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
  const bestScore = results.reduce((best, result) => Math.max(best, result.score), 0);
  const totalTime = results.reduce((sum, result) => sum + result.elapsedSeconds, 0);

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

      <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-100/80 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Notice: Some answer keys may contain mistakes. If you find a wrong answer, report it so it can be corrected.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={results.length} icon={BookOpenCheck} detail="Saved on this device" tone="teal" />
        <StatCard label="Average" value={`${averageScore(results)}%`} icon={Target} detail="Across completed tests" tone="amber" />
        <StatCard label="Best Score" value={`${bestScore}%`} icon={BarChart3} detail="Highest result" tone="emerald" />
        <StatCard label="Practice Time" value={formatDuration(totalTime)} icon={Clock3} detail="Total focused time" tone="rose" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Subjects</h2>
            <Link to="/analytics" className="text-sm font-bold text-teal-700 hover:text-teal-600 dark:text-teal-300">
              Analytics
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {subjectProgress.length ? (
              subjectProgress.map((progress) => <SubjectProgressCard key={progress.subject.slug} progress={progress} />)
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400 md:col-span-2">
                Loading progress...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Badges</h2>
            <div className="mt-4 grid gap-3">
              {badges.length ? badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                  Loading badges...
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Recent attempts</h2>
            <div className="mt-4 space-y-3">
              {recentResults.length ? (
                recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{result.subject}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{result.stage}</p>
                      </div>
                      <span className="rounded-lg bg-teal-500/12 px-2.5 py-1 text-sm font-black text-teal-700 dark:text-teal-200">
                        {result.score}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{formatShortDate(result.completedAt)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                  No attempts yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
