import { Activity, BarChart3, Clock3, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchRemoteAnalytics, getLocalResults } from "../services/resultsService.js";
import { formatDuration, formatShortDate } from "../utils/time.js";

function normalizeRemoteResult(result, index) {
  return {
    id: result.id || `remote-${result.date || index}-${index}`,
    user: result.user,
    subject: result.subject,
    stage: result.stage || "Practice",
    score: Number(result.score || 0),
    correct: Number(result.correct || 0),
    wrong: Number(result.wrong || 0),
    unattempted: Number(result.unattempted || 0),
    totalQuestions: Number(result.totalQuestions || result.correct + result.wrong || 0),
    elapsedSeconds: Number(result.elapsedSeconds || 0),
    completedAt: result.completedAt || result.date || new Date().toISOString(),
    weakAreas: typeof result.weakAreas === "string" ? result.weakAreas.split(",").filter(Boolean).map((name) => ({ name: name.trim(), count: 1 })) : result.weakAreas || []
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [remoteResults, setRemoteResults] = useState([]);
  const [syncStatus, setSyncStatus] = useState("idle");
  const localResults = getLocalResults(user.email);

  useEffect(() => {
    let ignore = false;
    setSyncStatus("syncing");
    fetchRemoteAnalytics(user.email)
      .then((results) => {
        if (!ignore) {
          setRemoteResults((results || []).map(normalizeRemoteResult));
          setSyncStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) setSyncStatus("local");
      });

    return () => {
      ignore = true;
    };
  }, [user.email]);

  const results = remoteResults.length ? remoteResults : localResults;
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const best = results.reduce((score, result) => Math.max(score, result.score), 0);
  const totalTime = results.reduce((sum, result) => sum + (result.elapsedSeconds || 0), 0);

  const subjectBreakdown = useMemo(() => {
    const grouped = new Map();
    results.forEach((result) => {
      const current = grouped.get(result.subject) || { subject: result.subject, attempts: 0, totalScore: 0 };
      grouped.set(result.subject, {
        ...current,
        attempts: current.attempts + 1,
        totalScore: current.totalScore + result.score
      });
    });

    return [...grouped.values()].map((item) => ({
      ...item,
      average: Math.round(item.totalScore / item.attempts)
    }));
  }, [results]);

  const weakAreas = useMemo(() => {
    const counts = new Map();
    results
      .flatMap((result) => result.weakAreas || [])
      .forEach((area) => counts.set(area.name, (counts.get(area.name) || 0) + (area.count || 1)));

    return [...counts.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [results]);

  return (
    <>
      <PageHeader
        eyebrow="Performance analytics"
        title="Progress Tracking"
        description={syncStatus === "ready" ? "Showing synced Google Sheets results." : "Showing local result history for this browser."}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={results.length} icon={Activity} tone="teal" />
        <StatCard label="Average Score" value={`${average}%`} icon={Target} tone="amber" />
        <StatCard label="Best Score" value={`${best}%`} icon={BarChart3} tone="emerald" />
        <StatCard label="Time Practiced" value={formatDuration(totalTime)} icon={Clock3} tone="teal" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <SectionHeader eyebrow="Comparison" title="Subject performance" description="Average score by subject based on saved attempts." />
          <div className="mt-4 space-y-4">
            {subjectBreakdown.length ? (
              subjectBreakdown.map((item) => (
                <div key={item.subject} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{item.subject}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.attempts} attempts</p>
                    </div>
                    <StatusBadge tone={item.average >= 85 ? "success" : item.average >= 60 ? "accent" : "warning"}>{item.average}%</StatusBadge>
                  </div>
                  <div className="mt-3"><ProgressBar value={item.average} /></div>
                </div>
              ))
            ) : (
              <EmptyState icon={Activity} title="No subject analytics yet" description="Complete a quiz to populate subject averages." />
            )}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <SectionHeader eyebrow="Review queue" title="Weak topic ranking" description="Topics most often missed across attempts." />
          <div className="mt-4 space-y-3">
            {weakAreas.length ? (
              weakAreas.map((area, index) => (
                <div key={area.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{area.name}</span>
                  <StatusBadge tone="danger">{area.count}</StatusBadge>
                </div>
              ))
            ) : (
              <EmptyState icon={Target} title="No weak topics yet" description="Weak-topic ranking appears after missed answers are saved." />
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 glass-panel rounded-lg p-4 sm:p-5">
        <SectionHeader eyebrow="Timeline" title="Attempt history" description="Synced results are shown when available; otherwise local attempts are listed." />
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-white/10">
            <thead className="bg-slate-100/70 text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Correct</th>
                <th className="px-4 py-3">Wrong</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {results.map((result) => (
                <tr key={result.id} className="text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{result.subject}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{result.stage}</td>
                  <td className="px-4 py-3 font-black text-teal-700 dark:text-teal-200">{result.score}%</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{result.correct}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{result.wrong}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatShortDate(result.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!results.length ? (
            <div className="mt-4">
              <EmptyState icon={Activity} title="No attempts recorded" description="Submit a quiz to build your analytics timeline." />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
